# Copilot widget

This is the widget for your copilot, it's what your users will interact with.

It's a simple react application built to be used in any webpage as a widget, to download the latest build of the widget, go to the actions tab and download the latest build artifact.

## How to install

1. download the latest build artifact from the actions tab.

2. extract the zip file.

3. copy the `assets/*.js` file to your project.

4. reference the js file in your html file as follows:

   ```html
   <script src="[some_js_file].js"></script>
   ```

5. init the widget.

   ```html
   <script>
     // you should run it after window loads
     window.onload = () => {
       initAiCoPilot({
         initialMessage: "Hi Sir", // initial message obiviously.
         token: "not_super_secret_token", // your copilot token.
         rootId: "copilot-widget", //@optional: the root element id in which the widget will mount on
         triggerSelector: "#triggerSelector", // the selector of the element that will trigger the widget on click.
         apiUrl: "https://cloud.openchat.so/api", // the url of the copilot api.
         headers: {
           // headers that you want to send with every message request.
           Authorization: "Bearer your_auth_token_goes_here",
         },
         user: { name: "Some User" }, // @optional: user object
         containerProps: {}, // @optional: `HTMLProps`
       });
     };
   </script>
   ```

### How to use

1. click on the trigger element to open the widget.

2. type your message and press enter to send it.

<img width="394" alt="OpenCopilot widget" src="https://github.com/openchatai/OpenCopilot/assets/32633162/77b30faa-c59e-4a3a-821a-d14a61a49a65">
