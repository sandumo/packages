import { FC, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { getFileURL } from '../../utils';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';

import { useSortable } from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import { AddImageIcon, CloseIcon } from '../../icons';
import FileInput from '../FileInput';
import Typography from '../Typography';
import IconButton from '../IconButton';
import { FileReference } from '@sandumo/file-reference';

// type FileReference = {

//   // id: string;
//   name: string;
//   path: string;
//   size: number;
//   type: string;
// }

type FilePickerProps = {
  name?: string;
  label?: string;
  defaultValue?: (File | FileReference)[];
}

type FileOrReference = File | FileReference;

const eptaToFile = (value: any) => {
  if (value instanceof File) {
    return value;
  }

  const blob = new Blob([JSON.stringify(value)], { type: 'application/file-reference' });

  return new File([blob], value?.name || 'file.json', { type: 'application/file-reference' });
};

const getContents = async (file: File): Promise<any> => {
  const reader = new FileReader();

  // return reader.readAsText(file);

  // read.readAsBinaryString(file);

  // reader.onloadend = function() {
  //   console.log('[x] ', read.result);
  // };

  return new Promise((resolve, reject) => {
    reader.onload = (event: any) => {
      resolve(JSON.parse(event.target.result));
    };
    reader.onerror = (event: any) => {
      reject(event.target.error);
    };
    reader.readAsBinaryString(file); // change this if you want to read the file as e.g. text
  });
};

export default function FilePicker({ name, label, defaultValue }: FilePickerProps) {
  const [files, __setFiles] = useState<File[]>([]);
  const [_files, _setFiles] = useState<(FileOrReference | null)[]>([]);
  const [fileUrls, setFileUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    (async () => {
      __setFiles(defaultValue ? defaultValue.map(file => eptaToFile(file)) : []);
      _setFiles(defaultValue || []);
      setFileUrls(defaultValue ? defaultValue.map(file => file instanceof File ? getFileURL(file) : `/api/storage/${file.path}`) : []);
      setItems(defaultValue ? defaultValue.map((file, index) => index + 1) : []);
    })();
  }, [defaultValue]);

  const ff = async () => {
    const fss = [];

    for (const file of files) {
      if (file.type === 'application/file-reference') {
        fss.push(await getContents(file));
      } else {
        fss.push(file);
      }
    }

    // console.log('[x] files', files, fss);
  };

  ff();

  const appendFiles = async (newFiles: File[]) => {
    __setFiles(files => [...files, ...newFiles]);
    _setFiles(files => [...files, ...newFiles]);
    setFileUrls(files => [...files, ...newFiles.map(file => getFileURL(file))]);
    setItems(items => {
      const maxValue = Math.max(...items, 0);

      return [...items, ...newFiles.map((file, index) => maxValue + index + 1)];
    });
  };

  const setFiles = async (files: File[]) => {
    const _files: FileOrReference[] = [];

    // const allFiles = [...files, ...newFiles];

    for (const file of files) {
      if (file.type === 'application/file-reference') {
        _files.push(await getContents(file));
      } else {
        _files.push(file);
      }
    }

    __setFiles(files);
    _setFiles(_files);
    setFileUrls(_files.map(file => file instanceof File ? getFileURL(file) : `/api/storage/${file.path}`));
  };

  // console.log('[x] epta files', files, _files);

  const [items, setItems] = useState<number[]>([]);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id && over?.id && active.id !== over.id) {
      // const oldIndex = Number(active.id) - 1;
      // const newIndex = Number(over.id) - 1;

      // const oldIndex = fileUrls.indexOf(String(active.id));
      // const newIndex = fileUrls.indexOf(String(over.id));

      // console.log('[x] drag end', active.id, over.id, oldIndex, newIndex);

      // _setFiles(files => arrayMove(files, oldIndex, newIndex));
      // __setFiles(files => arrayMove(files, oldIndex, newIndex));
      // setFileUrls(fileUrls => arrayMove(fileUrls, oldIndex, newIndex));

      const newItems = arrayMove(items, items.indexOf(Number(active.id)), items.indexOf(Number(over.id)));

      setItems(newItems);

      // setItems((items) => {
      //   const oldIndex = items.indexOf(Number(active.id));
      //   const newIndex = items.indexOf(Number(over.id));

      //   return arrayMove(items, oldIndex, newIndex);
      // });

      setTimeout(() => {
        const newFiles: File[] = [];

        for (const item of newItems) {
          const file = _files[item - 1] as FileOrReference;
          newFiles.push(eptaToFile(file));
        }

        // setFiles(files => newFiles);

        // console.log('[x] items drop', newItems, newFiles);

        __setFiles(newFiles);

        // setFileUrls(newFiles.map(file => file instanceof File ? getFileURL(file) : `/api/storage/${file.path}`));
        // setItems(items => items.map((i, index) => index + 1));
      }, 100);
    }

    setActiveId(null);
  }

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const columns = 3;
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  // const activeFileUrl = fileUrls.find((file, index) => index + 1 === activeId);
  const activeFileUrl = fileUrls.find(fileUrl => fileUrl === activeId);

  // console.log('[x] items render', items, files);

  const removeItem = (item: number) => {
    const index = item - 1;
    const itemIndex = items.indexOf(item);

    // console.log('[x] ept', item, index, itemIndex);

    if (items.length === 1) {
      setItems([]);
      __setFiles([]);
      _setFiles([]);
      setFileUrls([]);
    } else {
      setItems(items => items.filter(i => i !== item));
      __setFiles(files => files.filter((file, i) => i !== itemIndex));
      _setFiles(files => files.map((file, i) => i === index ? null : file));
      setFileUrls(fileUrls => fileUrls.map((file, i) => i === index ? null : file));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
    >
      {label && <Typography sx={{ fontSize: 12, fontWeight: 700, mb: '.25rem!important' }}>{label}</Typography>}

      <SortableContext items={items} strategy={rectSortingStrategy}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 100px)',
          gap: 2,
        }}>

          {_files && _files.length > 0 && (
            items.map((item, index) => (
              <SortableItem
                key={item}
                id={item}
                url={fileUrls[item - 1] as string}
                onClickDelete={() => removeItem(item)}
              />
            ))
          )}

          <FileInput name={name} multiple files={files} onChange={(files) => appendFiles(files)}>
            {({ input, props }) => (
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  border: '1px solid #00000010',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#00000006',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#00000010',
                  },
                }}

                {...props}
              >
                <AddImageIcon sx={{ color: '#00000080', fontSize: 28 }} />
                {input}
              </Box>
            )}
          </FileInput>

        </Box>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: '0 0' }}>
        {activeId ? <Item url={fileUrls[Number(activeId) - 1] as string} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export type SortableItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'id'> & {
  id: UniqueIdentifier;
  withOpacity?: boolean;
  isDragging?: boolean;
  url: string;
  onClickDelete?: () => void;
};

const SortableItem: FC<SortableItemProps> = ({ url, onClickDelete, ...props }) => {
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <Box
      style={style}
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      id={String(props.id)}
    >
      <Item url={url} withOpacity={isDragging} onClickDelete={onClickDelete} />
    </Box>
  );
};

type ItemProps = {
  url: string;
  isDragging?: boolean;
  withOpacity?: boolean;
  onClickDelete?: () => void;
}

function Item({ url, isDragging, withOpacity, onClickDelete }: ItemProps) {
  return (
    <Box sx={{
      opacity: withOpacity ? 0 : 1,
      position: 'relative',
      width: 100,
      height: 100,
      borderRadius: 1,
      overflow: 'hidden',
      border: '1px solid #00000010',
      bgcolor: '#fff',
      cursor: 'grab',
      ...(!isDragging && {
        '&:hover > .FilePickerImageButtons': {
          visibility: 'visible',
          opacity: 1,
        },
      }),
    }}>
      <Image
        src={url}
        fill
        objectFit="cover"
        alt=""
      />

      <Box className="FilePickerImageButtons" sx={{
        visibility: 'hidden',
        opacity: 0,
        transition: 'visibility 0s, opacity 0.2s',
      }}>
        {onClickDelete && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              zIndex: 1,
              bgcolor: '#00000070',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              p: '2px',
              '&:hover': {
                bgcolor: '#00000080',
              },
            }}
            size="small"
            onClick={() => onClickDelete()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
