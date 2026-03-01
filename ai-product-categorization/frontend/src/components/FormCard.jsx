import React from 'react';

export default function FormCard({ form, onSelect }) {
    return (
        <div className="card form-card">
            {form.img && (
                <img src={form.img} alt={form.name} className="form-card-image" />
            )}
            <div className="form-card-content">
                <div className="form-authority">{form.authority}</div>
                <h3 className="form-name">{form.name}</h3>
                <p className="form-desc">{form.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span className="badge badge-success">Available</span>
                    <button className="btn btn-outline" onClick={onSelect}>Fill This Form</button>
                </div>
            </div>
        </div>
    );
}
