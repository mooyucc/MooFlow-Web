import React from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { NODE_WIDTH } from '../../constants/nodeLayout';
import { getCanvasBridge } from '../../utils/canvasBridge';
import { CalendarIcon } from './TaskNodeIcons';

const TaskNodeDateSection = ({
  task,
  date,
  setDate,
  open,
  setOpen,
  lang,
  t,
  updateTask,
}) => (
  <foreignObject x={0} y={40} width={NODE_WIDTH} height={28}>
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ConfigProvider locale={lang === 'zh' ? zhCN : enUS}>
        <div
          style={{
            fontSize: 10,
            color: '#555',
            background: 'rgba(243, 243, 246, 0.8)',
            borderRadius: 6,
            padding: '2px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: task.autoDate ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            marginTop: 0,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            border: 'none',
            height: 24,
          }}
          onClick={() => {
            if (!task.autoDate) setOpen(true);
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
            <CalendarIcon size={12} />
          </span>
          {date ? date.format(lang === 'zh' ? 'YYYY年M月D日' : 'YYYY/M/D') : t('set_date')}
        </div>
        <DatePicker
          value={date}
          onChange={value => {
            setDate(value);
            updateTask(task.id, { date: value ? value.toDate() : null, autoDate: false });
            getCanvasBridge().cascadeUpdateDates?.(task.id);
          }}
          onOk={value => {
            setDate(value);
            updateTask(task.id, { date: value ? value.toDate() : null, autoDate: false });
            setOpen(false);
            getCanvasBridge().cascadeUpdateDates?.(task.id);
          }}
          open={task.autoDate ? false : open}
          onOpenChange={task.autoDate ? undefined : setOpen}
          showToday
          showTime={false}
          showOk
          format={lang === 'zh' ? 'YYYY年M月D日' : 'YYYY/M/D'}
          inputReadOnly
          getPopupContainer={() => document.body}
          suffixIcon={null}
          allowClear
          disabled={task.autoDate}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
          renderExtraFooter={() => (
            <button
              type="button"
              style={{
                color: '#e11d48',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                margin: '0 auto',
                display: 'block',
                fontSize: 14,
                padding: 4,
              }}
              onClick={e => {
                e.stopPropagation();
                setDate(null);
                updateTask(task.id, { date: null, autoDate: false });
                setOpen(false);
              }}
            >
              {t('clear_date')}
            </button>
          )}
        />
      </ConfigProvider>
    </div>
  </foreignObject>
);

export default TaskNodeDateSection;
