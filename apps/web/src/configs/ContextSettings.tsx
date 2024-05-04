import { useQueryClient } from '@tanstack/react-query';
import api from 'api-client';
import { useEffect } from 'react';

export default function ContextSettings() {
  // Set the queryClient for the api-client
  const queryClient = useQueryClient();
  useEffect(() => {
    api.config.queryClient = queryClient;
  }, [queryClient]);

  return <></>;
}
