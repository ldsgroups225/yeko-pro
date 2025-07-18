import {
  ArchiveIcon,
  DownloadIcon,
  UploadIcon,
  ViewGridIcon,
  ViewHorizontalIcon,
} from '@radix-ui/react-icons'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ActionsAndViewModeToggleProps {
  isTableViewMode: boolean
  onToggleViewMode: () => void
  onArchive?: () => void
  onDownload?: () => void
  onUpload?: () => void
  toggleViewModeTestId?: string
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
  toggleViewModeTestId,
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle View Mode"
              onClick={onToggleViewMode}
              {...(toggleViewModeTestId ? { 'data-testid': toggleViewModeTestId } : {})}
            >
              {isTableViewMode
                ? (
                    <ViewHorizontalIcon width={16} height={16} />
                  )
                : (
                    <ViewGridIcon width={16} height={16} />
                  )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isTableViewMode ? 'Vue en Grille' : 'Vue en Tableau'}</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 w-[1.5px]" />
        {onArchive && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Archive"
                onClick={onArchive}
              >
                <ArchiveIcon width={16} height={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive</p>
            </TooltipContent>
          </Tooltip>
        )}
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Download"
                onClick={onDownload}
              >
                <DownloadIcon width={16} height={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exporter</p>
            </TooltipContent>
          </Tooltip>
        )}
        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Upload"
                onClick={onUpload}
              >
                <UploadIcon width={16} height={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Importer</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
