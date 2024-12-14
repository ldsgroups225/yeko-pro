import React from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArchiveIcon,
  DownloadIcon,
  UploadIcon,
  ViewGridIcon,
  ViewHorizontalIcon,
} from '@radix-ui/react-icons'

interface ActionsAndViewModeToggleProps {
  isTableViewMode: boolean
  onToggleViewMode: () => void
  onArchive?: () => void
  onDownload?: () => void
  onUpload?: () => void
}

/**
 * Component for displaying actions for a data view (e.g., toggle view mode, archive, download, upload).
 *
 * @param {ActionsAndViewModeToggleProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ActionsAndViewModeToggle: React.FC<ActionsAndViewModeToggleProps> = ({
  isTableViewMode,
  onToggleViewMode,
  onArchive,
  onDownload,
  onUpload,
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle View Mode"
        onClick={onToggleViewMode}
      >
        {isTableViewMode ? (
          <ViewHorizontalIcon width={16} height={16} />
        ) : (
          <ViewGridIcon width={16} height={16} />
        )}
      </Button>
      <Separator orientation="vertical" className="h-6 w-[1.5px]" />
      {onArchive && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Archive"
          onClick={onArchive}
        >
          <ArchiveIcon width={16} height={16} />
        </Button>
      )}
      {onDownload && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Download"
          onClick={onDownload}
        >
          <DownloadIcon width={16} height={16} />
        </Button>
      )}
      {onUpload && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Upload"
          onClick={onUpload}
        >
          <UploadIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
