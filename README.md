# CurrencyConverter

A vanilla Javascript widget for converting currency among CAD, USD and EUR.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

A modern browser such as:

```
IE 11+, latest Chrome, Firefox, Android L+ browser, or iOS Safari
```

### Installing

Copy the four files in the same folder (eg. /demo) on your web server

```
index.html
widget.js
widget.css
favicon.ico
```

### Demo

Open the link to this folder on your browser

```
https://www.myhost.com/demo/index.html
```

Put a number into the first input box for amount of money to be converted; then choose what currency this amount is; finally, choose the target currency under *Converted amount:*.

## Usage

In your html file, put in these two lines into head section include the widget files:

```
<link rel="stylesheet" type="text/css" href="widget.css">
<script type="text/javascript" src="widget.js"></script>
```
In the body section, put in a div element with an uniqe id, such as:

```
<div id="firstInstanceOfWidget"></div>
```

In the script section, after the page is loaded, add these lines to invoke the rendering of widget:

```
var firstInstanceOfWidget = document.getElementById('firstInstanceOfWidget');
firstInstanceOfWidget.innerHTML = ccGetTemplate();
```
