import type { APIRoute } from 'astro'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
})

const CONTEXT = `
Juan Carlos Ordóñez Palazón es un desarrollador Full-Stack con más de 3 años de experiencia en el desarrollo de aplicaciones web empresariales.

INFORMACIÓN DE CONTACTO:
- Web personal: juan-carlos.dev
- Email profesional: dev.jcarlos@gmail.com
- LinkedIn: /juan-carlosordóñez-palazón-170113200

EXPERIENCIA PROFESIONAL:

1. NTT DATA (mayo 2022 - Presente) | Full Stack Developer
   • Desarrollo y mantenimiento de aplicaciones con Spring Boot, Java 11/17, TypeScript, React y Zustand
   • Interacción directa con clientes para resolución de problemas
   • Migración a tecnologías modernas y mejora continua de procesos
   • Implementación de pruebas unitarias y de integración
   • Optimización de bases de datos y consultas
   • Trabajo en equipo con metodologías ágiles
   • Desarrollo de evolutivos para mejorar UX

2. Capgemini (junio 2021 - mayo 2022) | Full Stack Developer
   • Desarrollo full-stack con Spring Boot, React, Java y JavaScript
   • Diseño de arquitectura e implementación de patrones de diseño
   • Gestión de proyectos Scrum
   • Desarrollo de componentes backend y frontend
   • Gestión de bases de datos y optimización

3. NTT DATA (marzo 2021 - junio 2021) | Prácticas Software Developer
   • Desarrollo de aplicaciones móviles con Kotlin y Cordova
   • Implementación de pruebas automatizadas con Espresso
   • Trabajo con metodologías ágiles Scrum
   • Desarrollo de evolutivos

EDUCACIÓN:
- Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web
  CES Vegamedia (2019 - 2021)

STACK TECNOLÓGICO:
Frontend:
- React
- TypeScript
- JavaScript
- Astro
- CSS
- Zustand

Backend:
- Java (11, 17)
- Spring Boot
- Pruebas unitarias y de integración

Mobile:
- Kotlin
- Cordova
- Espresso (testing)

Metodologías y Herramientas:
- Scrum
- Git
- Metodologías ágiles
- Patrones de diseño
- Arquitectura de software

PERFIL PROFESIONAL:
Desarrollador inquieto y proactivo, constantemente buscando aprender nuevas tecnologías y mejorar las existentes. Especializado en React, Astro y Spring Boot, pero abierto a explorar nuevas herramientas. Experiencia significativa en desarrollo full-stack, con énfasis en la creación de aplicaciones web empresariales escalables y mantenibles.
`

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente virtual profesional que representa a Juan Carlos Ordóñez Palazón. 
          Utiliza el siguiente contexto para responder preguntas sobre su experiencia, habilidades y trayectoria profesional:
          ${CONTEXT}
          
          Directrices para responder:
          1. Sé profesional pero amigable y cercano
          2. Proporciona respuestas detalladas y específicas basadas en la experiencia real
          3. Si te preguntan sobre tecnologías específicas, menciona proyectos o experiencias relevantes
          4. Si te preguntan algo que no está en el contexto, indica amablemente que no tienes esa información específica
          5. Destaca la experiencia en desarrollo full-stack y las habilidades técnicas cuando sea relevante
          6. Enfatiza el interés por el aprendizaje continuo y las nuevas tecnologías`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return new Response(
      JSON.stringify({
        response: completion.choices[0].message.content
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud"
      }),
      { status: 500 }
    )
  }
} 