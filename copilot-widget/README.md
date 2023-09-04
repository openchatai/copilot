# Copilot widget

This is the widget for your copilot, it's what your users will interact with.

It's a simple react application built to be used in any webpage as a widget, to download the latest build of the widget, go to the actions tab and download the latest build artifact.

## How to install

1. download the latest build artifact from the actions tab.

2. extract the zip file.

3. copy the `assets/*` folder to your project.
   this folder contains css and js files that are needed for the widget to work.

4. add the js file in your html file as follows:

   ```html
   <script src="[some_js_file].js"></script>
   ```

5. don't add the css file in your html file, instead, the script will inject the css files dynamically.

6. init the widget.

   ```html
   <script>
     // you should run it after window loads
     window.onload = () => {
       initAiCoPilot({
         initialMessage: "Hi Sir", // initial message obiviously.
         token: "not_super_secret_token", // your copilot token.
         triggerSelector: "#triggerSelector", // the selector of the element that will trigger the widget on click.
         apiUrl: "https://cloud.openchat.so/api", // the url of the copilot api.
         headers: {
           // headers that you want to send with every message request.
           Authorization: "Bearer your_auth_token_goes_here",
         },
       });
     };
   </script>
   ```

### How to use

1. click on the trigger element to open the widget.

2. type your message and press enter to send it.

<img width="394" alt="OpenCopilot widget" src="https://github.com/openchatai/OpenCopilot/assets/32633162/77b30faa-c59e-4a3a-821a-d14a61a49a65">

