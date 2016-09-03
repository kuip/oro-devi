Meteor.publish('file', function(id) {
  if(typeof id == 'string')
    var query = {_id: id}
  else
    var query = id
  console.log('file sub: ' + JSON.stringify(query))
  return OroFile.find(query)
})

Meteor.publish('files', function(query) {
  /*console.log(query)
  for(k in query)
    if(query[k]['$regex'])
      query[k]['$regex'] = new RegExp(query[k]['$regex'])*/

  console.log(query)
  console.log(OroFile.find(query).count())
  return OroFile.find(query)
})