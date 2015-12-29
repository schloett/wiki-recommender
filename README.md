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

For inserting the citations in the markup used by wikipedia (wiki-code).  
The following message events are used to insert the citation at the current cursor position in the edited article:
* `eexcess.insertMarkup.text`:  
   Inserts the title of a document followed by a reference  referenced at the end of the article in the references section.  
* `eexcess.insertMarkup.image`