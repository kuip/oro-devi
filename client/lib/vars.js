import { ReactiveVar } from 'meteor/reactive-var';

let getPage = new ReactiveVar(),
	getFolder = new ReactiveVar(''),
	customRoutes = new ReactiveVar(),
	customRouter = new ReactiveVar();

export {
	getPage,
	getFolder,
	customRoutes,
	customRouter,
}
