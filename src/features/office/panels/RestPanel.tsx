import { useMemo, useState } from 'react';

import { useAppStore } from '../../../state/appStore';
import type { RestActivityType } from '../../../types/domain';
import { REST_ACTIVITY_LABELS, REST_ACTIVITY_SOURCE_LABELS } from '../rest/restActivities';

const panelStyle = {
  display: 'grid',
  gap: '16px',
  width: 'min(960px, calc(100vw - 440px))',
  padding: '20px',
  borderRadius: '24px',
  border: '1px solid rgba(136,200,255,0.14)',
  background: 'linear-gradient(180deg, rgba(8,18,30,0.78) 0%, rgba(5,10,18,0.74) 100%)',
  color: '#F7EEDA',
  boxShadow: '0 28px 80px rgba(0,0,0,0.34)'
} satisfies React.CSSProperties;

const cardStyle = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)'
} satisfies React.CSSProperties;

const furnitureDescriptions: Record<RestActivityType, string> = {
  tea: '茶案区适合低打扰待命、慢节奏陪伴和轻量聊天。',
  sleep: '沙发床用于回血和午睡，临时切出高强度工作节奏。',
  dance: '音乐角切到轻松活跃状态，用节奏感恢复精神。'
};

const sceneFurniture: Array<{
  furnitureName: string;
  activity: RestActivityType;
  top: string;
  left: string;
  width: string;
  height: string;
  tint: string;
}> = [
  {
    furnitureName: '茶案',
    activity: 'tea',
    top: '18%',
    left: '10%',
    width: '24%',
    height: '28%',
    tint: 'rgba(146, 108, 56, 0.42)'
  },
  {
    furnitureName: '沙发床',
    activity: 'sleep',
    top: '48%',
    left: '20%',
    width: '36%',
    height: '26%',
    tint: 'rgba(93, 88, 123, 0.42)'
  },
  {
    furnitureName: '音乐角',
    activity: 'dance',
    top: '24%',
    left: '66%',
    width: '22%',
    height: '42%',
    tint: 'rgba(116, 58, 128, 0.42)'
  }
];

export function RestPanel() {
  const restActivities = useAppStore((state) => state.restActivities);
  const beginRestActivity = useAppStore((state) => state.beginRestActivity);
  const clearRestState = useAppStore((state) => state.clearRestState);
  const currentState = useAppStore((state) => state.character.state);
  const latestActivity = useMemo(() => restActivities[0] ?? null, [restActivities]);
  const [statusMessage, setStatusMessage] = useState('牛马休息间已准备好。');

  const triggerActivity = (activity: RestActivityType, furnitureName: string) => {
    beginRestActivity(activity, 'panel', `在${furnitureName}触发`);
    setStatusMessage(`已在${furnitureName}切换到${REST_ACTIVITY_LABELS[activity]}状态。`);
  };

  return (
    <section aria-label="rest-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Rest Area</h2>
        <p style={{ margin: '6px 0 0', color: '#DCC9A6' }}>
          牛马休息间升级为家具触发模式：角色进房后，点击具体家具才会进入对应休息动作。
        </p>
      </div>

      <div style={{ color: '#F2E2BF' }}>{statusMessage}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '16px' }}>
        <section style={{ ...cardStyle, display: 'grid', gap: '14px' }}>
          <div>
            <h3 style={{ margin: 0 }}>休息间场景</h3>
            <p style={{ margin: '4px 0 0', color: '#CDB792', fontSize: '13px' }}>
              茶案、沙发床、音乐角分别对应喝茶、睡觉、跳舞三种动作。
            </p>
          </div>

          <div
            aria-label="rest-scene"
            style={{
              position: 'relative',
              minHeight: '320px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(247,212,139,0.16)',
              background:
                'radial-gradient(circle at 24% 22%, rgba(244, 205, 132, 0.18), transparent 22%), linear-gradient(180deg, rgba(54,38,23,0.95) 0%, rgba(28,20,11,0.97) 58%, rgba(18,14,10,0.98) 100%)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 18%, transparent 100%), linear-gradient(0deg, rgba(0,0,0,0.26) 0%, transparent 36%)'
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '8%',
                right: '8%',
                bottom: '10%',
                height: '18%',
                borderRadius: '18px',
                background: 'linear-gradient(180deg, rgba(87,58,28,0.78) 0%, rgba(53,34,17,0.9) 100%)',
                boxShadow: '0 -18px 36px rgba(0,0,0,0.18) inset'
              }}
            />

            {sceneFurniture.map((item) => (
              <button
                key={item.furnitureName}
                type="button"
                aria-label={`家具 ${item.furnitureName}`}
                onClick={() => triggerActivity(item.activity, item.furnitureName)}
                style={{
                  position: 'absolute',
                  top: item.top,
                  left: item.left,
                  width: item.width,
                  height: item.height,
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: `linear-gradient(180deg, ${item.tint} 0%, rgba(18,11,8,0.44) 100%)`,
                  color: '#FFF4DF',
                  display: 'grid',
                  alignContent: 'space-between',
                  textAlign: 'left',
                  padding: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.24)'
                }}
              >
                <strong style={{ fontSize: '16px' }}>{item.furnitureName}</strong>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#F6DCAB' }}>{REST_ACTIVITY_LABELS[item.activity]}</span>
                  <span style={{ fontSize: '12px', color: '#DEC9A3', lineHeight: 1.45 }}>
                    {furnitureDescriptions[item.activity]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {sceneFurniture.map((item) => (
              <article
                key={`${item.furnitureName}-legend`}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'grid',
                  gap: '6px'
                }}
              >
                <strong>{item.furnitureName}</strong>
                <span style={{ color: '#F1D9AE', fontSize: '12px' }}>{REST_ACTIVITY_LABELS[item.activity]}</span>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
          <section style={{ ...cardStyle, display: 'grid', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0 }}>当前状态</h3>
              <p style={{ margin: '4px 0 0', color: '#CDB792', fontSize: '13px' }}>
                当前动作会同步到角色 HUD，便于观察数字员工是否正在休息。
              </p>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <div>
                <strong>动作：</strong>
                <span style={{ color: '#F6E8C6' }}>{latestActivity ? latestActivity.label : '待命'}</span>
              </div>
              <div>
                <strong>状态：</strong>
                <span style={{ color: '#F6E8C6' }}>{currentState}</span>
              </div>
              <div>
                <strong>来源：</strong>
                <span style={{ color: '#F6E8C6' }}>
                  {latestActivity ? REST_ACTIVITY_SOURCE_LABELS[latestActivity.source] : '暂无'}
                </span>
              </div>
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
        </section>
      </div>
    </section>
  );
}
