import { defineClientPlugin } from "@common/plugin-sdk/client";

function ExamplePage() {
  return <div>Example Plugin Page HMR XD</div>;
}

export default defineClientPlugin({
  routes: [
    {
      path: "example",
      element: <ExamplePage />,
      children: [
        {
          path: "test",
          element: <ExamplePage />,
        },
      ],
    },
  ],
});
