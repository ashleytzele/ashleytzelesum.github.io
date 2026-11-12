# Adding photos and videos to the photo wall

This file is a prompt. Put new media in a folder on the Desktop, then paste the prompt at the bottom into Claude (or any coding agent) with this repo connected.

## 1. Before you ask: put the files in place

1. Make a folder in `~/Desktop/img/` and name it the way the caption should read, for example `Lake Tahoe, CA` or `The R & B tour`.
2. Drop in the original photos (`.jpg`, `.jpeg`, `.heic`, `.png`) and videos (`.mov`, `.mp4`) straight from Photos. Use File → Export → **Export Unmodified Original** so videos keep full quality.
3. Optional: rename a single file to give that one photo its own caption, for example `Boba the midnight killer.jpeg`. Camera names such as `IMG_2950.jpeg` or `DO01152406.JPG` mean "use the folder name".
4. Keep anything private out: no client work, screens with client names, or other people's faces you don't have permission to post.

## 2. The prompt

Copy everything inside the box.

```
Add the new media in ~/Desktop/img/<FOLDER NAME> to the photo wall on
ashleytzelesum.com (repo: ashleytzele/ashleytzelesum.github.io, page: life.html).
Read AGENTS.md first; its confidentiality rules apply.

Captions
- Caption = the file name if I renamed the file, otherwise the folder name.
  Sentence case, fix obvious typos, no years or other numbers.
- Category ("cat") is one of: Travel, Concerts, Game day, Swimming, Film, Random.
  Pick the one that fits the folder.

Photos
- Fix the rotation from EXIF, convert to JPEG.
- Full image: longest side 1300 px, quality ~84 → img/life/<slug>.jpg
- Thumbnail: 460 px wide → img/life/t/<slug>.jpg
- Item: {"cat","t","src","th","w","h"} where w/h are the thumbnail's pixel size.

Videos
- Watch a contact sheet first. Cut black or shaky intros and outros.
- Wall copy (plays silently in the grid) → img/life/v/<slug>.mp4
  H.264 High profile, yuv420p (iPhone cannot play 4:4:4), 30 fps, short side 720 px
  (landscape 1280x720, portrait 720x1280), CRF 28, no audio, +faststart.
  If longer than ~15 s, loop the best 10-15 s on the wall.
- Viewer copy (opens on click, with sound) → img/life/hd/<slug>.mp4
  Same settings but short side 1080 px, CRF 23-28, AAC 128k audio.
  Keep it under 19 MB (the artifact limit is 20 MB a file; GitHub refuses 100 MB).
- If the video has black bars (letterboxed), crop to the real picture.
- Thumbnail from a good frame, 460 px wide → img/life/t/<slug>.jpg
- Item: {"cat","t","src","th","w","h","type":"video","hd"} where w/h are the
  wall copy's pixel size. Videos are placed in the widest columns automatically.

Placing
- Add the items to the ITEMS array in life.html next to related items
  (same trip or same concert), not all at the end.
- Pan the wall in a browser and check every new tile loads, plays and is
  the right shape. Check the media by eye for any confidential text.

Ship
- Run `node --test` (confidential-terms scan). It must pass.
- Commit with author 169638949+ashleytzele@users.noreply.github.com and push main.
- If the claude.ai artifact copy exists, publish the same files there too;
  it holds at most 256 MB, so drop files neither page references if it is full.
- Tell me what was added, how each video was trimmed, and the captions used.
```

## 3. After it's live

- The site updates a minute or two after the push. On iPhone, close and reopen the tab, because Safari keeps an old copy.
- Once you've checked the wall, the originals in `~/Desktop/img/<FOLDER NAME>` can be deleted. The repo keeps the web versions only, not the full-size originals, so keep your own backup in Photos or iCloud.
