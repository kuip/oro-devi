import { ReactiveVar } from 'meteor/reactive-var';

let getPage = new ReactiveVar();
let getFolder = new ReactiveVar('');

export { 
	getPage,
	getFolder,
}