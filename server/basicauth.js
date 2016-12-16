let username = process.env.USERNAME,
	password = process.env.PASSWORD;

var basicAuth = new HttpBasicAuth(username, password);
basicAuth.protect(['/files']);
