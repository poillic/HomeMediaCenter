
# Files & Folders
All music files are stored in `/music`

`music/album/file.mp3`

Album covers are stored in `images/covers/album_name.[jpg,png]`
Artist portraits are stored in `images/artist/artist_name.[jpg,png]`

# Database structure

## Track
- ID
- Title
- Artists
- Album.ID
- Duration
- FilePath
- Genre 

## TrackArtist - JOIN TABLE FOR FEATURING
- Track.ID
- Artist.ID
- Role { main, featured, producer }

## Artist
- ID
- Name
- Bio [Optionnal]
- ImagePath [Optionnal]

## AlbumArtist - JOIN TABLE FOR FEATURING
- Album.ID
- Artist.ID
- Role { main, featured, producer }

## Album
- ID
- Title
- Cover
- Year

## Vidéos
[WIP]

