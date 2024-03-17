import { createGlobalStyle } from "styled-components";

export const GlobalResetStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    min-width: 0;
    min-height: 0;
  }
  
  :host {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
  font-feature-settings: normal;
  font-variation-settings: normal;
}

  input,
  label,
  select,
  button,
  textarea {
    border: 0;
    outline: none;
    box-shadow: none;
    display: inline-block;
    vertical-align: middle;
    white-space: normal;
    background: transparent;
    line-height: 1;
    font-size: 1rem;
    color: inherit;
  }
  input:focus {
    outline: 0;
  }
  
  input,
  textarea {
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }
  button,
  input[type="reset"],
  input[type="button"],
  input[type="submit"],
  input[type="checkbox"],
  input[type="radio"],
  select {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  
  input[type="search"] {
    -webkit-appearance: textfield;
    -webkit-box-sizing: content-box;
  }
  ::-webkit-search-decoration {
    display: none;
  }
  button,
  input[type="reset"],
  input[type="button"],
  input[type="submit"] {
    overflow: visible;
    width: auto;
  }
  ::-webkit-file-upload-button {
    padding: 0;
    border: 0;
    background: transparent;
  }
  textarea {
    vertical-align: top;
    overflow: auto;
  }
  select[multiple] {
    vertical-align: top;
  }
div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
`;
