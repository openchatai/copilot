import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import ParametersField from './ParametersField';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import HeadersField from './HeadersField';
import { BodyField } from './BodyField';

type Props<T> = {
    defaultData?: Partial<T>;
    actionData?: T;
    // setData: (data: Partial<T>) => void;
    onChange?: (data: T) => void;
}

export function ActionForm() {
    const actionForm = useForm();

    return (
        <div className="contents">
            <div className='p-3 flex items-center gap-5'>
                <div className='flex-1'>
                    <Input className='flex-1' />
                </div>
                <Select>
                    <SelectTrigger className='w-fit'>
                        <SelectValue placeholder='Method' />
                    </SelectTrigger>
                    <SelectContent>
                    </SelectContent>
                </Select>
            </div>
            <div className='p-3'>
                <Tabs defaultValue='headers'>
                    <TabsList unstyled className='*:text-sm space-x-2'>
                        <TabsTrigger unstyled className='tab-trigger' value='headers'>Headers</TabsTrigger>
                        <TabsTrigger unstyled className='tab-trigger' value='parameters'>Parameters</TabsTrigger>
                        <TabsTrigger unstyled className='tab-trigger' value='body'>Body</TabsTrigger>
                    </TabsList>
                    <Card className='mt-4 text-secondary-foreground'>
                        <CardContent className='p-4'>
                            <TabsContent unstyled value='headers'>
                                <HeadersField />
                            </TabsContent>
                            <TabsContent unstyled value='parameters'>
                                <ParametersField />
                            </TabsContent>
                            <TabsContent unstyled value='body'>
                                <BodyField />
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    )
}