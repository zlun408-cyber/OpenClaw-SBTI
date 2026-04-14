import { useMemo, useState } from 'react';

import { useAppStore } from '../../../state/appStore';
import type { RestActivityType } from '../../../types/domain';
import {
  REST_ACTIVITY_LABELS,
  REST_ACTIVITY_SOURCE_LABELS
} from '../rest/restActivities';

const panelStyle = {
  display: 'grid',
  gap: '16px',
  width: 'min(900px, calc(100vw - 440px))',
  padding: '20px',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'linear-gradient(180deg, rgba(28,20,11,0.94) 0%, rgba(16,11,8,0.97) 100%)',
  color: '#F7EEDA',
  boxShadow: '0 28px 80px rgba(0,0,0,0.34)'
} satisfies React.CSSProperties;

const cardStyle = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)'
} satisfies React.CSSProperties;

const actionButtonStyle = {
  display: 'grid',
  gap: '6px',
  textAlign: 'left' as const,
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid rgba(247,212,139,0.22)',
  background: 'linear-gradient(180deg, rgba(95,59,26,0.32) 0%, rgba(56,35,18,0.28) 100%)',
  color: '#FFF4DF',
  cursor: 'pointer'
};

const activityDescriptions: Record<RestActivityType, string> = {
  tea: '进入低打扰陪伴状态，适合待命与轻度闲聊。',
  sleep: '切到深度休息状态，适合暂时不接收高强度任务。',
  dance: '进入活跃放松状态，用轻松方式恢复精神。'
};

export function RestPanel() {
  const restActivities = useAppStore((state) => state.restActivities);
  const beginRestActivity = useAppStore((state) => state.beginRestActivity);
  const clearRestState = useAppStore((state) => state.clearRestState);
  const currentState = useAppStore((state) => state.character.state);
  const latestActivity = useMemo(() => restActivities[0] ?? null, [restActivities]);
  const [statusMessage, setStatusMessage] = useState('牛马休息间已准备好。');

  const triggerActivity = (activity: RestActivityType) => {
    beginRestActivity(activity, 'panel');
    setStatusMessage(`已切换到${REST_ACTIVITY_LABELS[activity]}状态。`);
  };

  return (
    <section aria-label="rest-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Rest Area</h2>
        <p style={{ margin: '6px 0 0', color: '#DCC9A6' }}>
          牛马休息间用于放空、回血和轻量陪伴，动作切换会同步到数字员工状态。
        </p>
      </div>

      <div style={{ color: '#F2E2BF' }}>{statusMessage}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        <section style={{ ...cardStyle, display: 'grid', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0 }}>休息动作</h3>
            <p style={{ margin: '4px 0 0', color: '#CDB792', fontSize: '13px' }}>
              走到休息间后，可以选择当前的放松方式。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
            {(['tea', 'sleep', 'dance'] as RestActivityType[]).map((activity) => (
              <button
                key={activity}
                type="button"
                aria-label={`休息动作 ${REST_ACTIVITY_LABELS[activity]}`}
                style={actionButtonStyle}
                onClick={() => triggerActivity(activity)}
              >
                <strong>{REST_ACTIVITY_LABELS[activity]}</strong>
                <span style={{ color: '#DEC9A3', fontSize: '12px', lineHeight: 1.5 }}>
                  {activityDescriptions[activity]}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <strong>当前状态：</strong>
              <span style={{ color: '#F6E8C6' }}>
                {latestActivity ? latestActivity.label : '待命'} / {currentState}
              </span>
            </div>
            <button
              type="button"
              aria-label="结束休息"
              onClick={() => {
                clearRestState();
                setStatusMessage('已结束休息，返回待命。');
              }}
            >
              返回待命
            </button>
          </div>
        </section>

        <section style={{ ...cardStyle, display: 'grid', gap: '12px', alignContent: 'start' }}>
          <div>
            <h3 style={{ margin: 0 }}>休息记录</h3>
            <p style={{ margin: '4px 0 0', color: '#CDB792', fontSize: '13px' }}>
              方便观察数字员工当前是否在摸鱼、睡觉或跳舞回血。
            </p>
          </div>

          {restActivities.length === 0 ? (
            <p style={{ margin: 0, color: '#CDB792' }}>暂无休息记录。</p>
          ) : (
            restActivities.map((activity) => (
              <article
                key={activity.id}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'grid',
                  gap: '6px'
                }}
              >
                <strong>{activity.label}</strong>
                <span style={{ color: '#E7D8B5', fontSize: '12px' }}>
                  {REST_ACTIVITY_SOURCE_LABELS[activity.source]}
                </span>
                {activity.note ? (
                  <span style={{ color: '#CDB792', fontSize: '12px' }}>{activity.note}</span>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </section>
  );
}
