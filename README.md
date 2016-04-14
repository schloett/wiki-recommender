# wiki-recommender chrome-extension

This chrome extension is based on the EEXCESS [chrome-extension](https://github.com/EEXCESS/chrome-extension).

## Description

This extension provides useful information in form of images and articles while you write your Wikipedia article.

To get access to this information you only have to activate the extension by pressing on its icon.
Then you can use the search-bar for submitting a search query or you can hit enter during writing. Then suitable content for your current paragraph is searched. Additionally it is possible to select text with the mouse and search suitable results for the selection.
These found search results can then be viewed in detail and inserted into the article at the current cursor position.

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