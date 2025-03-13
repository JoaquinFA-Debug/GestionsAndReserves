import { useEffect, useState } from 'react';
import './App.css';


interface Reservation {
    id: number;
    serviceID: number; 
    reservationDate: Date;
    clientDni: string;
    clientName: string;
}

interface Service {
    id: number;
    serviceName: string;
}

function App() {
    const [servicesTypes, setServices] = useState<Service[]>();
    const [reservations, setReservations] = useState<Reservation[]>();
    useEffect(() => {
        populateServices();
        populateReserves();
    }, []);

    const serviceOptions = servicesTypes === undefined
        ? <option value="loading...">loading...</option>
        : servicesTypes.map(service =>
            <option value={service.id}>{service.serviceName}</option>
        );

    const allReservations = reservations === undefined
        ? <option value="loading...">loading...</option>
        : reservations.map(r => 
            <div className="reservation" id={r.id.toString()}>
                <p>ID De servicio: {r.serviceID}</p>
                <p>Dni del cliente: {r.clientDni}</p>
                <p>Nombre del cliente: {r.clientName}</p>
                <p>Fecha de la reserva: {r.reservationDate.toString()}</p>
            </div>
        );

    
    function ReservationsForm() {
        const [formData, setFormData] = useState({
            name: "",
            dni: "",
            serviceType: "",
            serviceDate: ""
        })
        const [validDni, setDniValid] = useState(true);
        const [validName, setNameValid] = useState(true);
        const [validForm, setValidForm] = useState(true);
        const isDniValidRegex = /^[0-9]{1,3}\.?[0-9]{3,3}\.?[0-9]{3,3}$/;

        const setDniData = (dniNum: string) => {
            setFormData({ ...formData, dni: dniNum })

            if (!isDniValidRegex.test(dniNum)) {
                setDniValid(false);
            } else {
                setDniValid(true);
            }
            return validDni;
        };

        const setNameData = (name: string) => {
            setFormData({ ...formData, name: name.trim().toLowerCase().replace(/[^a-z]/g, '') })

            if (typeof name != 'undefined' && name.length > 0) {
                setNameValid(true);
            } else {
                setDniValid(false);
            }
            return validName;
        };

        const formSubmit = (formData: FormData) => {

            if (validDni && validName) {
                setValidForm(true);

                fetch('/api/Reservations/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ServiceID: formData.get("serviceType"),
                        ReservationDate: formData.get("serviceDate"),
                        ClientDni: formData.get("dni"),
                        ClientName: formData.get("name")
                    })
                })
            } else {
                setValidForm(false);
            }
        }

        return (
            <form action={formSubmit}>
                {validForm ? "":"Existen errores en los campos porfavor llenar correctamente y volver a reservar"}
                <label htmlFor="serviceType">
                    Servicio:
                    <select name="serviceType" value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}>
                        {serviceOptions}
                    </select>
                </label>
                <label htmlFor="serviceDate">
                    Fecha:
                    <input
                        type="date"
                        name="serviceDate"
                        id="serviceDate"
                        value={formData.serviceDate}
                        onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    />
                </label>
                <label htmlFor="name">{validName ? "":"Porfavor ingrese un nombre valido "}Nombre:
                    <input
                        type="text"
                        name="name"
                        id="name"
                        maxLength={20}
                        value={formData.name}
                        onChange={(e) => setNameData(e.target.value)}
                    />
                </label>
                <label htmlFor="dni">{validDni ? "":"Porfavor ingrese un dni valido "}DNI:
                    <input
                        type="number"
                        name="dni"
                        id="dni"
                        value={formData.dni}
                        onChange={(e) => setDniData(e.target.value)}
                    />
                </label>
                <button type="submit">Reserva</button>

                <div>{allReservations}</div>
            </form>
        )
    }

    return (
        <div>
            <h1 id="tableLabel">Formulario de Reservas</h1>
            <p>Porfavor rellene todos los campos necesarios.</p>
            {ReservationsForm()}
        </div>
    );

    async function populateServices() {
        const response = await fetch('/api/Reservations/GetServiceTypes');
        if (response.ok) {
            const data = await response.json();
            setServices(data);
        }
    }

    async function populateReserves() {
        const response = await fetch('/api/Reservations/GetAllReservations');
        if (response.ok) {
            const data = await response.json();
            setReservations(data);
        }
    }

}

export default App;