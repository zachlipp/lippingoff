---
title: Implementing Distributed Tracing
outputs: reveal
date: 2023-01-01
venue: PyCascades 2023
description: An intermediate look at getting distributed tracing running and finding use for it
reveal_hugo:
  custom_theme: css/tracing.css
  transition: none
---


<section data-noprocess class="title-card">
<h3>
  Implementing Distributed Tracing
</h3>
  Zach Lipp (he/him/his)

  Senior Machine Learning Engineer, Numerator

  24 February 2023
</section>

---

### Roadmap

- What is distributed tracing?
- Tracing by metaphor
- Distributed tracing concepts
- Example service and code walkthrough
- How tracing works
- Review of tracing in practice

---

### Distributed tracing concepts?

- Distributed tracing (hereafter tracing) is an observability tool
- Tracing follows a request through a distributed system

---

### Tracing by metaphor

{{% fragment %}}
Commuting
{{% /fragment %}}

---

### Tracing by metaphor
![](figs/commute.svg)

---

### Tracing by metaphor
![](figs/duration.svg)

---

### Tracing by metaphor
![](figs/duration_trace.svg)

---

### Tracing by metaphor
![](figs/tags.svg)

---

### Tracing by metaphor
![](figs/tags2.svg)

---

### Quick review

{{% fragment %}}
- **Traces** follow a request through an entire system
{{% /fragment %}}
{{% fragment %}}
- A trace contains one or more (usually more) **spans** which represent units of work. (A function, a service, etc.)
{{% /fragment %}}
{{% fragment %}}
- Spans can have arbitrary data associated with them. We can call these key-value pairs **tags** or **attributes**
{{% /fragment %}}
{{% fragment %}}
- Tags tend to be **sparse** and **high-dimensional**. Backends generally store traces in NoSQL databases as a result
{{% /fragment %}}

---

### Tracing tools

{{% fragment %}}
- Tracing is an open standard. There are tons of open source and vendored tracing tools
{{% /fragment %}}
{{% fragment %}}
- `opentelemetry` sets standards for creating and propogating traces
{{% /fragment %}}
{{% fragment %}}
- `zipkin` and `jaeger` are common tools for collecting and visualizing traces (here we'll use `jaeger`)
{{% /fragment %}}

---

### Example: Fizzbuzz

{{% fragment %}}
- Given an integer `x`:
  - If `x` is divisible by 3, return `"Fizz"`
  - If `x` is divisible by 5, return `"Buzz"`
  - If `x` is divisible by 15, return `"FizzBuzz"`
{{% /fragment %}}

---

### Example system: Fizzbuzz

Introducing **FBaaS - FizzBuzz as a Service**

{{% fragment %}}
https://github.com/zachlipp/pycascades_demo_2023
{{% /fragment %}}

---

### Example system: Fizzbuzz

![](figs/flow.svg)

---

### Example system: Fizzbuzz

- `docker-compose` exposes the hub at `localhost:6000`
- We can send a request for an integer `x` to it with the payload `{"number": x}`

---

### Example system: Fizzbuzz

![](figs/demo.gif)

---

### Why is this taking so long?

Let's trace it!

(Available at branch `tracing-example`)

---

### Distributed tracing: Visualized

![](figs/jaeger.png)

---

### Distributed tracing: Visualized

![](figs/traces.png)

---

### Distributed tracing: Visualized

![](figs/traceview.png)

This is what's called **the traceview**

---

### What's going on here?

Two ways to think about that question:
1. How does this work under the hood?
2. What does the Python code for this look like?

---

### How does tracing work?

Programs need **context** to associate traces together

{{% fragment %}}
![](figs/context.svg)

{{% /fragment %}}

---

### What is trace context?

{{% fragment %}}
A context consists of, at a minimum, the `trace_id` and `span_id` of the previous operation
{{% /fragment %}}

{{% fragment %}}
Tracing HTTP requests works by propogating a header called `traceparent` through each component of your system

This header contains the `trace_id` and `span_id` in the format `f"00-{trace_id}-{span_id}-00"`
{{% /fragment %}}

{{% fragment %}}
For more information, check out the [W3C standards](https://www.w3.org/TR/trace-context/)
{{% /fragment %}}

---

### What about the rest of the system?

{{% fragment %}}
  - The program creates a span associated with a trace
{{% /fragment %}}
{{% fragment %}}
  - A collector collects the trace and sends it to a backend service
{{% /fragment %}}
{{% fragment %}}
  - The backend service stores the trace
{{% /fragment %}}
{{% fragment %}}
  - A frontend allows users to visualize traces from the backend
{{% /fragment %}}

---

### Enough concepts, time for code

---

### How do you implement this in Pyton?

{{% fragment %}}
`opentelemetry` has a rich collection of open source packages
{{% /fragment %}}
{{% fragment %}}
It's even possible to `autoinstrument` popular servers
  - `FastAPI`
  - `Flask`
{{% /fragment %}}
{{% fragment %}}
We'll look at `diff`s to emphasize what implementing tracing does
{{% /fragment %}}

---

### Configure your exporter

```diff
+ from opentelemetry import trace
+ from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
+     OTLPSpanExporter,
+ )
+ from opentelemetry.sdk.resources import Resource
+ from opentelemetry.sdk.trace import TracerProvider
+ from opentelemetry.sdk.trace.export import BatchSpanProcessor
+
+
+ resource = Resource(attributes={"service.name": SERVICE_NAME})
+ trace.set_tracer_provider(TracerProvider(resource=resource))
+ tracer = trace.get_tracer(__name__)
+ otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4317", insecure=True)
+ span_processor = BatchSpanProcessor(otlp_exporter)
+ trace.get_tracer_provider().add_span_processor(span_processor)
```

---

### Autoinstrumentation: FastAPI (`hub`)

```diff
+from opentelemetry.propagate import inject
+from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def call_remote_service(
  number: int, service: Literal["fizzer", "buzzer"]
)
+    headers = {}
+    inject(headers)
-    response = requests.post(url, json={"number": number})
+    response = requests.post(url, json={"number": number}, headers=headers)
ders)


app = FastAPI()
+FastAPIInstrumentor.instrument_app(app)
```

---

### Autoinstrumentation: Flask (`buzzer`)

```diff
-from flask import Flask, jsonify, request
+import json
+
+from flask import Flask, make_response, request
+from opentelemetry.propagate import inject
+from opentelemetry.instrumentation.flask import FlaskInstrumentor

app = Flask(__name__)
+FlaskInstrumentor().instrument_app(app)

@app.route("/", methods=["POST"])
def buzz():
+    headers = {"Content-Type": "application/json"}
+    inject(headers)
     x = request.json["number"]
     buzz = bool(x % 5 == 0)
-    return jsonify({"result": buzz})
+    return make_response(json.dumps({"result": buzz}), 200, headers)
```

---

### Manual instrumentation (`fizzer`)
```diff
+from opentelemetry import trace
+from opentelemetry.context import Context
+from opentelemetry.propagate import inject
+from opentelemetry.trace.propagation import tracecontext
+
+FORMAT = tracecontext.TraceContextTextMapPropagator()

@app.route("/", methods=["POST"])
def fizz():
-    x = request.json["number"]
-    fizz = bool(x % 3 == 0)
-    return jsonify({"result": fizz})
+    traceparent = request.headers.get("traceparent")
+    with tracer.start_as_current_span(
+        "/", context=FORMAT.extract({"traceparent": traceparent})
+    ) as fizzspan:
+        headers = {}
+        inject(headers)
+        x = request.json["number"]
+        fizz = bool(x % 3 == 0)
+        return make_response(json.dumps({"result": fizz}), 200, headers)
```

---

### Manual vs auto
![](figs/auto_instrumented_span.png)

---

### Manual vs auto
![](figs/manual_span.png)

{{% fragment %}}
```python
...
   with tracer.start_as_current_span(
       "/", context=FORMAT.extract({"traceparent": traceparent})
   ) as fizzspan:
         user_agent = request.headers.get("user-agent")
         fizzspan.set_attribute("http.user_agent", user_agent)
...
```
{{% /fragment %}}

---

### Python over! Now what?

{{% fragment %}}
Let's talk about results!
{{% /fragment %}}

---

### Tracing: Lessons learned

- My team identified a large bottleneck in our own codebase with autoinstrumentation
- After creating a manual span, we isolated a bottelneck to one of our dependencies

---

### Is this worth it?

{{% fragment %}}
Tracing is clearly a complicated solution
{{% /fragment %}}

{{% fragment %}}
This is a complicated problem
{{% /fragment %}}

---

### Is it worth it? Alternatives

{{% fragment %}}
[Service meshes](https://linkerd.io/2019/08/09/service-mesh-distributed-tracing-myths/) can identify latency
{{% /fragment %}}

{{% fragment %}}
It's possible to approximate tracing without header propogation, see [Sachin Ashok and Vipul Harsh](https://www.youtube.com/watch?app=desktop&v=xSoF5XRx8l8)
{{% /fragment %}}

---

### Is it worth it? Getting more value

{{% fragment %}}
[**Go beyond the traceview**](https://copyconstruct.medium.com/distributed-tracing-weve-been-doing-it-wrong-39fc92a857df)
{{% /fragment %}}

{{% fragment %}}
Services can operate on traces (e.g. demarcating types of traffic)
{{% /fragment %}}

{{% fragment %}}
Teams can use traces to directly analyze traffic across service paths
{{% /fragment %}}

{{% fragment %}}
[If traces are backed up to a SQL storage (or use a SQL-like tool)]((https://danluu.com/tracing-analytics/), engineers can easily build custom analyses and tools
{{% /fragment %}}

---

### Summary

{{% fragment %}}
- Tracing is a valuable observability tool, but its implementation can require substantial changes
{{% /fragment %}}
{{% fragment %}}
- When considering tracing, consider alternatives that don't require application code changes
{{% /fragment %}}
{{% fragment %}}
- To get the most value from tracing, replicate trace data to a SQL-compatible backend and let developers query it directly
{{% /fragment %}}
