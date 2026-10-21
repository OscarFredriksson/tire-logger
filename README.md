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

### Throwaway car-selection UI prototype

```bash
yarn prototype
```

Opens a browser-only sample at
`http://127.0.0.1:5174/prototype.html#/cars?variant=A`.
Use the floating arrows (or left/right keyboard arrows) to compare:

- `A`: Garage cards — visual car cards and a straightforward workspace header.
- `B`: Pit wall roster — split landing page and a strong car-identity panel.
- `C`: Race ledger — tabular selection and a centered editorial workspace header.

Click a car to enter its workspace, then click the large car name to switch cars.
The prototype lab rehearses multiple-car, single-car, and empty startup states.
Adding, archiving, restoring, and importing only change in-memory sample data;
export is simulated. Reload to reset. The Electron app and its database are not used.

The prototype is a design comparison, not a production implementation. After a
design is chosen, preserve the alternatives on a throwaway branch and implement
the chosen design separately.
