# Custom Table Visualization

## Installation:

### Prerequisites:

- [Node](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)

### Clone this repo and install with:

- ```yarn install```

### Build the project:

- ```yarn build```


### From Looker, add a `visualization` parameter to your project's `manifest.lkml` file:

```
visualization: {
  id: "table_vis"
  label: "Custom Table"
  file: "custom_table.js"
}
```

Copy the file generated during the build, `dist/custom_table.js`, to the Looker project.


Looker custom visualization ref:
- https://github.com/looker/custom_visualizations_v2/blob/master/docs/getting_started.md
- https://github.com/looker/custom_visualizations_v2
- https://cloud.google.com/looker/docs/reference/param-manifest-visualization
