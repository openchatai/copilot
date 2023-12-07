import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

type Props = NodeProps<{}>

function ActionBlock({ }: Props) {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className='nodrag nopan'>
                <label htmlFor="text">Text:</label>
                <input id="text" name="text" className="nodrag" />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
}
export default memo(ActionBlock)