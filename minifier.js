import objectMerge from 'lodash.merge';
import { minify } from 'html-minifier-terser';

function HTMLMinifier(opts) {
  const defaultOpts = {
    override: false,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true
    }
  };

  if (!opts) {
    opts = {};
  }

  opts = objectMerge(defaultOpts, opts);

  if (opts.exception_url.constructor !== Array) {
    opts.exception_url = [opts.exception_url];
  }

  function minifier(req, res, next) {
    let skip = false;

    opts.exception_url.every((exception) => {
      switch (true) {
        case exception.constructor === RegExp:
          skip = exception.test(req.url);
          break;
        case exception.constructor === Function:
          skip = exception(req, res) || false;
          break;
        case exception.constructor === String:
          skip = req.url.match(exception);
          break;
        default:
      }

      return !skip;
    });

    const sendMinified = function (callback) {
      // No callback specified, just minify and send to client.
      if (typeof callback === 'undefined') {
        return function (err, html) {
          if (err) {
            return next(err);
          }
          Promise.resolve(
            minify(html, opts.htmlMinifier)
          ).then(data => {
            // console.log(data);
            res.send(data);
          }).catch(() => {
            res.send(html);
          });
        };
      } else {
        // Custom callback specified by user, use that one
        return function (err, html) {
          if (html) {
            html = Promise.resolve(
              minify(html, opts.htmlMinifier)
            ).then(data => {
              callback(err, data);
            }).catch(err => {
              callback(err, html);
            });
          } else {
            callback(err, html);
          }
        };
      }
    };

    res.renderMin = function (view, renderOpts, callback) {
      this.render(view, renderOpts, sendMinified(callback));
    };

    if (opts.override && !skip) {
      res.oldRender = res.render;
      res.render = function (view, renderOpts, callback) {
        this.oldRender(view, renderOpts, sendMinified(callback));
      };
    }

    return next();
  }

  return (minifier);
}

export default HTMLMinifier;
