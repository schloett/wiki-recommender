# wiki-recommender chrome-extension

This chrome extension is based on the EEXCESS [chrome-extension](https://github.com/EEXCESS/chrome-extension).

## setup
1. Clone the repository
2. Use `npm install` to install the required node modules (requires [node.js](https://nodejs.org/))
3. Use `bower install` to install the dependencies (if bower however has not been made available by npm, try installing it manually and globally with `npm -g install bower`)
4. Go to `chrome://extensions/`
5. Activate developer mode
6. Click on  `load an unpacked extension`, locate and select your cloned repo

## events

For inserting the citations the markup used by wikipedia is used (wiki-code).  
Each events' data has to contain the document information required by c4's markup module.  
The following message events are used to insert the citation at the current cursor position in the edited article:

* `eexcess.insertMarkup.text`:  
   Inserts the title of a document followed by a reference referenced at the end of the article in the references section.  
* `eexcess.insertMarkup.image`  
   Inserts the image with a thumbnail on the right side labeled with its title.

For getting the displayed page's origin these events are used:

* `eexcess.getOrigin.request`:  
   Requests origin from the content script.
* `eexcess.getOrigin.response`:  
   Returns the origin.  
   The origin is contained in the event's data:
    ```
    origin: "https://en.wikipedia.org"
    ```