---
title: Caching data with Docker
author: Zach
date: 2021-02-20T00:00:00
slug: docker-data-caching
categories: []
tags: []
---

In a welcome change of pace, I had an idea last week.

I am quite impressed with Garret Dash Nelson's [snowpiles visualization](http://viewshed.matinic.us/2018/01/13/1139), and I wanted to reproduce it given our shocking winter. The project consists of the following:

- A Python script to pull snowfall maps from the NOAA
- Some gdal functions to reproject the maps into the Albers projection and convert the snowfall to hillshades
- Some imagemagick calls to crop the maps and convert them to gifs
- A final imagemagick call to create an animated gif

This looks like a typical data science pipeline: retrieving data, transforming it, and then doing what you actually want with it. In the interest of time and conscientiousness to the NOAA's servers, I wanted to build the pipeline off a local sample of maps before running it on everything at once.

I knew I needed a local data cache and I was already using Docker. Here enters my idea: **Can I use Docker layers to cache these maps?**

## Hey, it works!

Yes, Docker's cache works for just fine for data. Here's the map:

 [And here's](https://github.com/zachlipp/snowpiles/blame/b2bb3913ce7db0dde0ea4fd51a56a0e7bbeab524/Dockerfile) the relevant part of my Dockerfile:

{{< highlight docker >}}
COPY download_snow_maps.sh /home

WORKDIR home

RUN ./download_snow_maps.sh

COPY snowpiles.sh .

ENTRYPOINT ./snowpiles.sh
{{</ highlight >}}

The `COPY/RUN` layer pairing just for `download_snow_maps.sh` ensures Docker's cache of the downloaded maps won't get discarded if other files in the directory change. This let me debug and eventually finish the actual map generation code (`snowpiles.sh`) without pulling more maps. As well, the actual [data pulling code](https://github.com/zachlipp/snowpiles/blob/b2bb3913ce7db0dde0ea4fd51a56a0e7bbeab524/download_snow_maps.sh#L7) could now be wonderfully ignorant:

{{< highlight bash >}}
TODAY=$(date -I)
PAST=$(date -I -d "$TODAY - 4 months")
...
until [[ $PAST == $TODAY ]]; do
...
{{</ highlight >}}

I used a stale cache of data until I wanted to finish the map, then I just rebuilt the Docker image without cache (`docker build --no-cache`) to produce the final animation.

## Oh God, it works how?!

In retrospect, maybe "wonderfully ignorant" code isn't laudable. Problems include:

- The builds are particularly ugly. Builds shouldn't run scripts that fetch data, especially long-running and potentially intrusive ones.

- Caching the data pull obfuscates when I last updated the map - *I can't just rely on when I last ran the container!* Instead, I have to use `docker history` to find the layer created by executing `./download_snow_maps.sh`. Atrocious.
{{< highlight stdout >}}
   ➜ docker history snowpiles | grep 'download_snow'
   4e6770bac83f   5 days ago     /bin/sh -c ./download_snow_maps.sh              183MB
{{</ highlight >}}

- We know our data source regularly updates (daily in this case) and that every update of source data alters the produced visual. This means **our result depends on our build time**. I am one `docker system prune` away from a different result, and colleagues would be guaranteed one unless we synchonize when we build. I cannot repent enough.

- Similarly, this is a foolish way to store this data. The build either use the existing data or starts over. A much more sensible approach to this problem is to only fetch and transform maps we don't already have.

Caching data with Docker is clearly not a long-term solution. But what about a short-term one?

## Lesson learned: Solve one problem at a time

Reproducibility and efficiency are important goals for a project but *only if you actually finish the damn project.* Before I thought to use a Docker layer as a cache, I was trying to reason around caching in my initial code... while also figuring out the file names for NOAA's maps, how to convert maps when `ESPG` codes won't parse, and the appropriate delay between frames for the final animation. I found this exhausting. Had I not used this naive cache, I might have burned myself out writing loops in bash - a terrible way to go. It's not that the caching code I describe above is wildly sophisticated ([see for yourself](https://github.com/zachlipp/snowpiles/pull/1/)); it's that it's something else to worry about.

Caching steps in a data pipeline as layers in a Docker image is noxious and foul. Build times lengthen, data age hides itself in the dark corners of the Docker CLI (who even uses `docker history`?), reproducibility goes out the window, and all for **a "cache" that cannot update** - it exists as-is or it is rebuilt from scratch. No project should do this indefinitely, and no shared project should do it at all.

And yet it separated my concerns. I finished something I started (a rare treat), I reasoned about it, and I fixed the parts I didn't like. I don't know if that would have happened if I spent longer staring at bash conditions.
