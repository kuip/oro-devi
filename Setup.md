```
mongodump -h localhost:3001 --db meteor --collection orofile --query='{title: {$regex: /devicore/gm}}'
```
