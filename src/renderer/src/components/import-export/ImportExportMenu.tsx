import { ActionIcon, Button, Group, Loader, Menu, Modal, Tooltip } from '@mantine/core';
import { IconDownload, IconSettings, IconUpload } from '@tabler/icons-react';
import { useDataTransferActions } from './useDataTransferActions';

export function DataActionsMenu() {
  const {
    previewSummary,
    importPreviewOpen,
    exportLoadingOpen,
    closeImportPreview,
    closeExportLoading,
    onImportMenuClick,
    onConfirmImport,
    onExportMenuClick
  } = useDataTransferActions();

  return (
    <>
      <Menu shadow="md" position="bottom-end">
        <Menu.Target>
          <Tooltip label="Data actions" withArrow>
            <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Data actions">
              <IconSettings size={24} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconUpload size={14} />} onClick={onExportMenuClick}>
            Export data
          </Menu.Item>
          <Menu.Item leftSection={<IconDownload size={14} />} onClick={onImportMenuClick}>
            Import data
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={importPreviewOpen}
        onClose={closeImportPreview}
        title="Import Preview"
        size="lg"
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
          {previewSummary}
        </pre>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeImportPreview}>
            Cancel
          </Button>
          <Button onClick={onConfirmImport}>Import</Button>
        </Group>
      </Modal>

      <Modal opened={exportLoadingOpen} onClose={closeExportLoading} title="Exporting Data...">
        <Loader />
      </Modal>
    </>
  );
}
