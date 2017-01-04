import { getPage } from '/client/lib/vars';
import { customRouter, customRoutes } from '/client/lib/vars';

Template.OPagination.helpers({
  template: () => {
    let d = Template.instance().data || {},
      r = customRouter.get(),
      t = d.template + (r.router.location.query.page || 1);

    // Return <templateNameX>, where X = page number if template exists
    if(Template[t])
      return t;
    // Return templateName
    return d.template;
  },

  data: () => {
    let { pageTotal } = Template.instance().data || {},
      r = customRouter.get(),
      pageNo = 1;

    if(r.router.location.query.page) {
      pageNo = parseInt(r.router.location.query.page);
    }

    return {
      pageNo,
      pageTotal,
    }
  }
});

let pageRange = 2;

Template.paginationControls.helpers({
  prev: () => {
    let d = Template.instance().data;
    if(d.pageNo > 1)
      return true;
    return false;
  },

  next:() => {
    let d = Template.instance().data;

    if(d.pageNo < d.pageTotal)
      return true;
    return false;
  },

  rangeMin:() => {
    let d = Template.instance().data;
    return [1,2,3];
  },

  rangeMax:() => {
    return [5,6,7];
  }
});

Template.paginationControls.events({
    'click .prev': (ev, inst) => {
      let r = customRouter.get();

      if(r) {
        let no = parseInt(r.router.location.query.page || 1) - 1;
        let redir = r.router.location.pathname + "?page=" + no;
        r.props.history.push(redir);
      }
    },

    'click .next': (ev, inst) => {
      let r = customRouter.get();

      if(r) {
        let no = parseInt(r.router.location.query.page || 1) + 1;
        let redir = r.router.location.pathname + "?page=" + no;
        r.props.history.push(redir);
      }
    },
});
