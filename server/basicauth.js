import { username, password } from './auth';

var basicAuth = new HttpBasicAuth(username, password);
basicAuth.protect(['/files']);
