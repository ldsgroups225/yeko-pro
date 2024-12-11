
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Displays information about the school.
 */

interface School {
  name: string;
  imageUrl: string;
}

interface Props {
  school: School | null;
  isLoading: boolean;
}

export const SchoolInfo: React.FC<Props> = ({ school, isLoading }) => {
  const imageUrl = !school?.imageUrl || !school?.imageUrl.length ? '/school-placeholder.webp' : school?.imageUrl;
  
  return (
    <Card className="mb-4 shadow-lg border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {isLoading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <Image
              src={imageUrl}
              alt={school?.name ?? 'school image'}
              className="w-full h-48 object-cover"
              width={476}
              height={192}
            />
          )}
          <div className="p-4 bg-white">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-primary">
                  École : {school?.name}
                </h2>
                <p className="text-muted-foreground">Effectif : 3677</p>
                <p className="text-muted-foreground">Classe : 39</p>
                <p className="text-destructive text-xs animate-bounce">
                  TODO: Fix effective and class count
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
