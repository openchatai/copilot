# OpenCopilot widget

This is the widget for OpenCopilot: it's what your users will interact with.

It's a simple React application that can be used in any webpage as a widget. To download the latest build of the widget, go to the actions tab in GitHub and download the latest build artifact.

## How to install

1. Download the latest build artifact from the actions tab.

2. Extract the zip file.

3. Copy the `assets/*.js` file to your project.

4. Reference the js file in your HTML file as follows:

   ```html
   <script src="[some_js_file].js"></script>
   ```

5. Initialize the widget.

   ```html
   <script>
     // you should run it after window loads
     window.onload = () => {
       initAiCoPilot({
         initialMessage: "Hey, how can I help you today?", // initial bot message
         token: "not_super_secret_token", // your OpenCopilot token
         rootId: "copilot-widget", // @optional: the root element id in which the widget will mount on
         triggerSelector: "#triggerSelector", // the selector of the element that will trigger the widget on click
         apiUrl: "https://cloud.openchat.so/api", // the url of the OpenCopilot api.
         headers: {
           Authorization: "Bearer your_auth_token_goes_here",
         }, // @optional: headers that you want to send with every message request
         bot: {
            name: "AI Assistant",
            avatarUrl: "https://example.com/company-logo.png"
         }, // @optional: bot object – this info will be used in the chat
         user: {
            name: "John Doe",
            avatarUrl: "https://example.com/user-avatar.png"
         }, // @optional: user object – this info will be used in the chat
         containerProps: {}, // @optional: `HTMLProps`
         warnBeforeClose: true, // @optional: Set to false if you don't want to warn the user before closing the chat
         onClose: () => {
            console.log('Closing chat window.');
         } // @optional: Callback before closing the chat
       });
     };
   </script>
   ```

## How to use

1. Click on the trigger element to open the widget.

2. Type your message and press enter to send it.

<img width="394" alt="OpenCopilot widget" src="https://github.com/openchatai/OpenCopilot/assets/32633162/77b30faa-c59e-4a3a-821a-d14a61a49a65">
