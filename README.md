# oro-devi


- Start project:

```
meteor npm install
USERNAME=<USERNAME> PASSWORD=<PASSWORD> meteor

```

- Load required data:

```
cd oro-devi/public
mongorestore -h localhost:3001 dump
```

You will find the editable files at `http://localhost:3000/files`

## API

### Client

- file editor & viewer
```
files(/[TITLE || DIRECTORY])
```

- file viewer
```
file/[TITLE || _id]
```

- app/site viwer (loads a root directory as a site)
```
app/[TITLE || DIRECTORY]/[TEMPLATE]
```

- editor and viewer for keras models

```
keditor(/:id)
```

- SVG viewer

```
svg
```

### Server

- POST
```bash
curl --progress-bar --raw -X POST -F 'file=@"<TITLE>";type=<MIME TYPE>' '<SERVER URL>/api/insert?extension=<EXTENSION>&title=<TITLE>'

curl --progress-bar --raw -X POST -F 'file=@"model2_weights.buf";type=application/octet-stream' 'http://localhost:3000/api/insert?extension=buf&title=test/model3_weights.buf'
```

- GET:

```
http://localhost:3000/api/file/[TITLE / _ID]

http://localhost:3000/api/file/test/model3_weights.buf
```


## License

GPLv3 - see LICENSE file
