let username = process.env.USERNAME || Meteor.settings.USERNAME,
	password = process.env.PASSWORD || Meteor.settings.PASSWORD;

var basicAuth = new HttpBasicAuth(username, password);
basicAuth.protect(['/files']);
