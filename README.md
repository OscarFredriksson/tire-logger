# tire-logger

An Electron application with React and TypeScript

## Project Setup

### Install

```bash
$ yarn install
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Choosing a car

On a fresh launch, Tire Logger uses the unarchived cars in your garage:

- No cars: the empty landing page lets you add your first car.
- One car: that car's Stints open automatically.
- Multiple cars: choose a car from the full-width list of compact cards to open its Stints.

The selected car's name appears above navigation and remains visible when you
visit the application-wide Tracks page. Selection lasts only for this
application session; it is not saved as a preference. Loading or failed car
queries are not treated as an empty garage. Later data updates do not trigger
the fresh-launch single-car shortcut.

Click the selected car's name and chevron in the header to return to the roster.
On Tracks with no car selected, use the **Change car** back button instead.
This clears the selection. The entire application header is hidden on the car
selection screen, including while managing cars or when the garage is empty.
The **Cars** heading, **Manage cars**, and **Add car** controls remain available;
Tracks and data actions are not offered on this screen.
Even with just one car, returning deliberately keeps
the roster open instead of automatically reopening that car.

Choose **Manage cars** on the selection screen to edit or archive cars, or switch
between **Active** and **Archived** cars to edit or restore archived records.
Rows do not select cars while managing. **Done** returns to unarchived car selection,
without choosing a car automatically. **Add car** is available in both modes.
Archiving still requires confirmation and archives the car's tires and stints.
Restoring requires confirmation and does not select the car. Changes keep the
current management list open, even when it becomes empty.

There is no separate Cars tab or `/cars` route. Existing data actions remain
available in the header on other screens.

### Design reference

The car selection and management screens follow the Tracks screen's styling:
a standard page heading, gradient **Add car** button, compact Mantine cards,
and simple empty-state messages. Selection and management remain separate modes.
Card dimensions and name wrapping stay the same when switching between modes.

The original **B: Pit wall roster** inspired the selection flow, but its centered
layout and oversized rows have been replaced by the shared screen styling.
The original A/B/C sample-only alternatives are preserved on
[`throwaway/car-chooser-abc`](https://github.com/OscarFredriksson/tire-logger/tree/throwaway/car-chooser-abc)
(commit `d4a5002`). On that throwaway branch, run `yarn prototype` to compare
them; the prototypes do not use Electron or the application database.

### Renderer tests

Run `yarn test --runInBand src/renderer/src/App.test.tsx` for interactive App
coverage. These tests use the production App, real routing and query providers,
and a controlled Electron API boundary in Jest's jsdom environment.
