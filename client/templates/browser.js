import { customRouter } from '/client/lib/vars';
import { ReactiveVar } from 'meteor/reactive-var';

Template.OBrowser.onCreated(function() {
  let self = this;
  this.rows = 4;
  this.cols = 4;
  this.skip = new ReactiveVar(0);
  this.limit = new ReactiveVar(0);
  this.page = new ReactiveVar(1);

  this.autorun(() => {
    r = customRouter.get();
    if(r) {
      this.page.set(parseInt(r.router.location.query.page || 1));
      console.log("OBrowser page", this.page.get());
    }
  });

  this.autorun(() => {
    let { folder, rows, cols } = Template.currentData() || {},
      page = this.page.get();

    if(rows) {
      this.rows = rows;
    }
    if(cols) {
      this.cols = cols;
    }
    if(folder) {
      this.query = {title: {$regex: folder, $options: 'i'}};

      Meteor.call('countFiles', this.query, (err, res) => {
        if(err) {
          console.log(err);
        }
        if(res) {
          let skip = page > 0 ? ((page-1) * rows * cols) : 0,
            limit = Math.min(page * rows * cols, res);

          console.log('res, skip, limit:', res, skip, limit);
          self.subscribe('files', self.query, {
            skip,
            limit
          });
          self.skip.set(skip);
          self.limit.set(limit);
        }
      });
    }
  });
});

Template.OBrowser.helpers({
  template: () => {
    let { template } = Template.currentData() || {};
    return template;
  },

  pageNo: () => {
    let q = Template.instance().query;
    if(q)
      return OroFile.find(q).count();
  },

  docs: () => {
    let { query, skip, limit } = Template.instance();
    if(query)
      return OroFile.find(query, {skip: skip.get(), limit: limit.get()}).fetch();
    return [];
  }
});

Template.OBrowserGrid.onCreated(function() {
  this.d = new ReactiveVar();

  this.autorun(() => {
    let d = Template.currentData() || {};
    this.d.set(d);
  });
});

Template.OBrowserGrid.helpers({
  rows: () => {
    let { rows } = Template.instance().d.get(),
      arr = [];
    for(let i=1; i <= rows; i++) {
      arr.push(i);
    }
    return arr;
  },

  cols: () => {
    let { cols } = Template.instance().d.get(),
      arr = [];
    for(let i=1; i <= cols; i++) {
      arr.push(i);
    }
    return arr;
  },

  template: () => {
    let { gridTemplate } = Template.instance().d.get();
    return gridTemplate;
  },

  data: () => {
    let { docs, rows, cols } = Template.instance().d.get();
    let icol = Template.currentData();
    let irow = Template.parentData();
    return {
      json: docs[(irow-1) * cols + icol - 1]
    }
  },

  width: () => {
    let { cols } = Template.instance().d.get();
    return (100 - 4) / (cols || 1);
  }
});
