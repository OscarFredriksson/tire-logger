import { useState } from 'react';
import { Loader, Modal } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { queryClient } from '@renderer/main';
import { TitleWithButton } from '../common/TitleWithButton';

export function ExportButton() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportClick = async () => {
    setModalOpen(true);
    try {
      const result = await window.electron.ipcRenderer.invoke('exportData');
      if (result?.success) {
        Notifications.show({
          title: 'Export Successful',
          message: `Data exported to ${result.filePath}`,
          color: 'green'
        });
        await queryClient.refetchQueries();
      } else {
        if (result?.message === undefined) {
          return;
        }
        Notifications.show({
          title: 'Export Failed',
          message: result?.message,
          color: 'red'
        });
      }
    } catch (error: any) {
      Notifications.show({
        title: 'Export Failed',
        message: error.message,
        color: 'red'
      });
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <>
      <TitleWithButton
        buttonText="Export Data"
        onButtonClick={handleExportClick}
        buttonIcon={<IconUpload />}
      />
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Exporting Data...">
        <Loader />
      </Modal>
    </>
  );
}
