import React, { useEffect, useState } from 'react';
import { Table, Tag, Space } from 'antd';

const DocumentList = ({ documents }) => {
  const columns = [
    {
      title: 'File Name',
      dataIndex: 'originalName',
      key: 'name',
      sorter: (a, b) => a.originalName.localeCompare(b.originalName),
    },
    {
      title: 'Type',
      dataIndex: 'mimeType',
      key: 'type',
      render: type => <Tag color={typeColorMap[type]}>{type.split('/')[1]}</Tag>
    },
    {
      title: 'Received',
      dataIndex: 'processedAt',
      key: 'date',
      sorter: (a, b) => new Date(a.processedAt) - new Date(b.processedAt),
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <a href={record.storageUrl} target="_blank">View</a>
          <a href={record.storageUrl} download>Download</a>
        </Space>
      )
    }
  ];

  return <Table columns={columns} dataSource={documents} rowKey="storageUrl" />;
};