import React, { useEffect, useState } from 'react';
import Appointment from "./appointment.jsx"
import AppointmentCard from './appointmentCard.jsx';

const AppointmentList = ( props ) => {
    const [openAppointment, setOpenAppointment] = useState();

    const handleApptClick = (appointment) => {
        setOpenAppointment(appointment);
    };

    return (
        <div className="grid grid-cols-3">
            <div className='overflow-y-scroll overflow-x-hidden mx-5 my-5 max-h-screen max-h-30 col-start-1 col-span-1'>
            {props.appointments.length > 0 ? (
                props.appointments.map(appointment => (
                    <div key={appointment._id} className="h-1/12 max-h-30 w-full shadow-md my-2" onClick={() => handleApptClick(appointment)}>
                        <Appointment
                            name = {appointment.name} 
                            image = {appointment.image}
                            topic = {appointment.topic}
                            desc = {appointment.description}
                            starttime = {appointment.starttime}
                            endtime = {appointment.endtime}
                        >
                        </Appointment>
                        
                    </div>
                ))
            ) : (
                <p className=''>No appointments yet.</p>
            )}
            </div>
            <div className='col-start-2 col-span-2 min-h-screen max-h-screen min-w-full max-w-full mr-5'>
                {openAppointment != null ? (
                    <div className='bg-black h-screen min-h-screen mx-5 mr-5 my-5 min-w-full max-w-full'>
                        <AppointmentCard appointment={openAppointment || null}/>
                    </div>
                ) : (
                    <p className=''>No selected appointment.</p>
                )}
            </div>
        </div>
    );
};

export default AppointmentList;
