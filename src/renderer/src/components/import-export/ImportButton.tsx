// ImportButton.tsx
import { useState } from 'react';
import { Modal } from '@mantine/core';
import { TitleWithButton } from '../common/TitleWithButton';
import Zod from 'zod';
import { IconDownload } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { queryClient } from '@renderer/main';
import { importSchema } from '@shared/schema/importSchema';
import { ImportData } from '@shared/model';

export function ImportButton() {
  type Preview = {
    importedData: any;
    summary: string;
  } | null;

  const [preview, setPreview] = useState<Preview>(null);
  // const [warnings, setWarnings] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleImportClick = async () => {
    // Show warning popup first
    const confirmed = window.confirm(
      'Importing data will merge with your existing records.\nExisting tire records may be updated with new information.\n\nConsider creating a backup before proceeding.\n\nDo you want to continue?'
    );
    if (!confirmed) return;

    const result = await window.electron.ipcRenderer.invoke('selectImportFile');
    if (result.canceled) return;
    let importedData: ImportData | undefined;
    let summary = '';
    try {
      importedData = JSON.parse(result.fileContent) as ImportData;
      importSchema.parse(importedData);
      if (importedData.data) {
        summary = JSON.stringify(importedData.data, null, 2);
      }
    } catch (err: Zod.ZodError | any) {
      if (err instanceof Zod.ZodError) {
        Notifications.show({
          title: 'Import Failed',
          message: 'Import failed: Invalid data format',
          color: 'red'
        });
        return;
      }
    }
    setPreview({ importedData, summary });
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    await window.electron.ipcRenderer.invoke('confirmImport', preview?.importedData);
    setModalOpen(false);
    // Show success notification, refresh data, etc.
    Notifications.show({
      title: 'Import Successful',
      message: 'Data imported successfully',
      color: 'green'
    });
    await queryClient.refetchQueries();
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconDownload />}
        buttonText="Import Data"
        onButtonClick={handleImportClick}
      />
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Import Preview"
        size={'lg'}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
          {preview?.summary}
        </pre>
        <TitleWithButton buttonText="Import" onButtonClick={handleConfirm} />
      </Modal>
    </>
  );
}
