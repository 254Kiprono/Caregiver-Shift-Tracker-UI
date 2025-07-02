
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui-setupconfig/card';

interface ServiceNotesProps {
  serviceNotes: string;
}

const ServiceNotes: React.FC<ServiceNotesProps> = ({ serviceNotes }) => {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Service Notes:</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{serviceNotes}</p>
      </CardContent>
    </Card>
  );
};

export default ServiceNotes;
