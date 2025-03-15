## Setup file `.env`

To create and copy the .env file, run the following commands in the terminal:

```bash

cp .env-example .env

```

# 🎯 Managing Global Styles

The `App.css` file contains reusable CSS classes that are frequently used throughout the application.
Before adding a new class in a local CSS file, first check if a similar class already exists in `App.css`.

Class names should follow the Bootstrap naming convention to ensure consistency and maintainability.
When adding new classes, try to align them with Bootstrap's structure and naming patterns as much as possible.

### 📌 **Example**

Here’s an example of a Bootstrap-style utility class defined in `App.css`:

```css
.d-flex {
  display: flex;
}

.text-center {
  text-align: center;
}
```
