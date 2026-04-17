import { useState } from 'react';
import { Notifications } from '@mantine/notifications';
import Zod from 'zod';
import { queryClient } from '@renderer/main';
import { importSchema } from '@shared/schema/importSchema';
import { ImportData } from '@shared/model';

type Preview = {
  importedData: ImportData;
  summary: string;
} | null;

export function useDataTransferActions() {
  const [preview, setPreview] = useState<Preview>(null);
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [exportLoadingOpen, setExportLoadingOpen] = useState(false);

  const onImportMenuClick = async () => {
    const confirmed = window.confirm(
      'Importing data will merge with your existing records.\nExisting tire records may be updated with new information.\n\nConsider creating a backup before proceeding.\n\nDo you want to continue?'
    );
    if (!confirmed) return;

    const result = await window.electron.ipcRenderer.invoke('selectImportFile');
    if (result?.canceled) return;

    try {
      const importedData = JSON.parse(result.fileContent) as ImportData;
      importSchema.parse(importedData);

      const summary = importedData.data ? JSON.stringify(importedData.data, null, 2) : '';
      setPreview({ importedData, summary });
      setImportPreviewOpen(true);
    } catch (err: unknown) {
      if (err instanceof Zod.ZodError) {
        Notifications.show({
          title: 'Import Failed',
          message: 'Import failed: Invalid data format',
          color: 'red'
        });
        return;
      }

      Notifications.show({
        title: 'Import Failed',
        message: 'Import failed: Unexpected error while reading the file',
        color: 'red'
      });
    }
  };

  const onConfirmImport = async () => {
    if (!preview?.importedData) return;

    await window.electron.ipcRenderer.invoke('confirmImport', preview.importedData);
    setImportPreviewOpen(false);

    Notifications.show({
      title: 'Import Successful',
      message: 'Data imported successfully',
      color: 'green'
    });

    await queryClient.refetchQueries();
  };

  const onExportMenuClick = async () => {
    setExportLoadingOpen(true);
    try {
      const result = await window.electron.ipcRenderer.invoke('exportData');
      if (result?.success) {
        Notifications.show({
          title: 'Export Successful',
          message: 'Data exported to ' + result.filePath,
          color: 'green'
        });
        await queryClient.refetchQueries();
        return;
      }

      if (result?.message) {
        Notifications.show({
          title: 'Export Failed',
          message: result.message,
          color: 'red'
        });
      }
    } catch (error: unknown) {
      Notifications.show({
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Unexpected export error',
        color: 'red'
      });
    } finally {
      setExportLoadingOpen(false);
    }
  };

  return {
    previewSummary: preview?.summary ?? '',
    importPreviewOpen,
    exportLoadingOpen,
    closeImportPreview: () => setImportPreviewOpen(false),
    closeExportLoading: () => setExportLoadingOpen(false),
    onImportMenuClick,
    onConfirmImport,
    onExportMenuClick
  };
}
