import React from 'react';

const CALENDAR_DATA = [
  {
    season: ' Monsoon',
    months: 'June - October',
    desc: 'Requires warm weather and plenty of water.',
    crops: ['Rice (Paddy)', 'Maize', 'Cotton', 'Soybean', 'Sugarcane', 'Groundnut', 'Bajra', 'Jowar'],
    icon: '🌧️',
    color: '#dbeafe'
  },
  {
    season: 'Winter',
    months: 'October - March',
    desc: 'Needs cold weather for early growth and warm weather for harvesting.',
    crops: ['Wheat', 'Barley', 'Mustard', 'Oats', 'Chickpea (Gram)', 'Peas', 'Onion', 'Potato'],
    icon: '❄️',
    color: '#f3f4f6'
  },
  {
    season: 'Summer',
    months: 'March - June',
    desc: 'Short duration summer season crops, requiring artificial irrigation.',
    crops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Pumpkin', 'Bitter Gourd', 'Fodder Crops'],
    icon: '☀️',
    color: '#ffedd5'
  }
];

export default function PlantingCalendar() {
  return (
    <div>
      <div className="page-header">
        <h1>📅 Planting Calendar</h1>
        <p>Explore seasonal planting schedules to maximize your farm yield</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CALENDAR_DATA.map(season => (
          <div key={season.season} className="card" style={{ borderLeft: `4px solid ${season.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem', background: season.color, padding: '4px 8px', borderRadius: 8 }}>{season.icon}</span> 
                {season.season}
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>{season.months}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic' }}>{season.desc}</p>
            
            <div>
              <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: 10 }}>Recommended Crops & Plants:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {season.crops.map(crop => (
                  <span key={crop} style={{ padding: '6px 12px', background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-200)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 500 }}>
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <div className="alert alert-info" style={{ marginTop: 10 }}>
          <span><strong>Pro Tip:</strong> Specific planting times can vary based on your local microclimate and soil quality. Always factor in local weather patterns when sowing seeds!</span>
        </div>
      </div>
    </div>
  );
}