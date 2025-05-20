import { Button, createTheme } from '@mantine/core';

export const themeConstants = {
  TOOLTIP_OPEN_DELAY: 300
};

export const theme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: {
        radius: 'md'
      }
    })
  }
});
