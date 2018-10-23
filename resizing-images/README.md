# Purpose

A simple alternative for `gulp` in case you can not use `gulp`.

# Using

Install `ImageMagick` by running the command `sudo apt-get install imagemagick`

In the folder `resizing-image`, run `sudo chmod 777 resize.sh` (Only need once for the first time)

Now, whenever you create a new post:

1. Put the featured image in the same folder with `resize.sh`
2. Run `./resize.sh`
3. Done

It will create a new folder called `resized` contains all resized-named images (i.e, `*_lg.jpg`, `*_md.jpg`, `*_placehold.jpg`,...) for your post.
