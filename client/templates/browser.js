import { customRouter } from '/client/lib/vars';
import { ReactiveVar } from 'meteor/reactive-var';

Template.OBrowser.onCreated(function() {
  let self = this;
  this.rows = 4;
  this.cols = 4;
  this.skip = new ReactiveVar(0);
  this.limit = new ReactiveVar(0);
  this.page = new ReactiveVar(1);
  this.pageNo = new ReactiveVar(1);

  this.autorun(() => {
    r = customRouter.get();
    if(r) {
      this.page.set(parseInt(r.router.location.query.page || 1));
      //console.log("OBrowser page", this.page.get());
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
            //limit = Math.min(page * rows * cols, res);
            limit = rows * cols;

          //console.log('page, res, skip, limit:', page, res, skip, limit);
          if(self.handle)
            self.handle.stop();
          self.handle = self.subscribe('files', self.query, {
            skip,
            limit,
            sort: {"dateCreated": 1 }
          });
          self.skip.set(skip);
          self.limit.set(limit);
          self.pageNo.set(Math.ceil(res / rows / cols));
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
    return Template.instance().pageNo.get();
  },

  docs: () => {
    let { query, skip, limit } = Template.instance();
    //console.log('skip...', skip.get(), limit.get(), JSON.stringify(query));
    //console.log(OroFile.find(query).fetch().length);
    if(query) {
      return OroFile.find(query, {limit: limit.get(), sort: {dateCreated: 1}}).fetch()
      //return OroFile.find(query, {skip: skip.get(), limit: limit.get(), sort: {dateCreated: 1}}).fetch();
    }
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

  cols: function(a, b) {
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
    let icol = Template.currentData(),
      irow = Template.parentData(),
      ind = (irow-1) * cols + icol - 1;
    if(!docs[ind])
      return;
    return {
      json: docs[ind]
    };
  },

  width: () => {
    let { cols } = Template.instance().d.get();
    return (100 - 4) / (cols || 1);
  }
});
