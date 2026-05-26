import { ArrowLeft, BookOpen, Search, Store, Shield, Mail, Heart, Phone, MessageCircle, BarChart3, TrendingUp, Star, Bell, Inbox, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Manual() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-16 sm:top-20 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 h-16 flex items-center gap-4 box-content -mx-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-600" />
        </button>
        <h1 className="font-black text-xl text-neutral-800 flex-1">
          Manual de Usuario
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Intro */}
        <section className="space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-neutral-800">¡Bienvenido a VeciMarket!</h2>
          <p className="text-lg text-neutral-600 font-medium leading-relaxed">
            VeciMarket no es un "jueguito", es una herramienta pensada minuciosamente y diseñada a la medida para nosotros. 
            Nace como una solución a los problemas que enfrentamos en grupos de WhatsApp o en Facebook Marketplace, 
            donde un anuncio debe de publicarse casi a diario para "sobrevivir" y no quedar sepultado. 
            Aquí todo está organizado para que encuentres lo que buscas y vendas lo que ofreces de una forma permanente, justa y estructurada.
          </p>
        </section>

        <div className="grid gap-6">
          {/* El Algoritmo y Reseñas */}
          <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">El Algoritmo de Rotación y Reseñas</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Hemos implementado un sistema inteligente para que tus anuncios roten equitativamente. No te preocupes por quedar en el olvido ni publicar el mismo anuncio cada 2 horas.
            </p>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-3">
                <div className="mt-1"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /></div>
                <span><strong>Tu reputación te posiciona:</strong> Las reseñas, comentarios y la calificación general (estrellas) que los vecinos dejan en tu perfil o anuncio ayudan a destacarte. Un buen servicio significa mayor visibilidad.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><RefreshIcon /></div>
                <span><strong>Rotación Justa:</strong> El algoritmo da la oportunidad a todos los vecinos de aparecer en la pantalla de inicio equitativamente, mostrando sugerencias frescas cada día.</span>
              </li>
            </ul>
          </div>

          {/* Vender */}
          <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">Panel de Vendedor</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Todo lo que necesitas para gestionar tu negocio o ventas casuales desde tu Dashboard.
            </p>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-3">
                <div className="mt-1"><Package className="w-5 h-5 text-purple-500" /></div>
                <span><strong>Mis Anuncios:</strong> Gestiona tu catálogo. Agrega, edita o pausa anuncios que ya no estén disponibles sin perder su historial y sus reseñas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><Bell className="w-5 h-5 text-red-500" /></div>
                <span><strong>Notificaciones:</strong> Cada vez que alguien te solicita un producto o servicio por nuestra plataforma, de inmediato te entrará una alerta visual remarcada en la campanita.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
                <span><strong>Estadísticas Avanzadas:</strong> Revisa el detalle gráfico de cómo van tus ventas, número de vistas e interacciones diarias de tus anuncios.</span>
              </li>
            </ul>
          </div>

          {/* Buscar y Comprar */}
          <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">Búsqueda y Contacto</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Encuentra rápidamente qué comer, a quién llamar para un servicio técnico o ropa de segunda mano.
            </p>
            <ul className="space-y-3 text-neutral-600">
              <li className="flex items-start gap-3">
                <div className="mt-1"><Phone className="w-5 h-5 text-emerald-500" /></div>
                <span><strong>Llamada Directa:</strong> Si el vecino habilitó su número, puedes presionarlo para llamarlo de forma clásica.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><MessageCircle className="w-5 h-5 text-emerald-500" /></div>
                <span><strong>Escribir por WhatsApp:</strong> Podrás enviar un mensaje pre-armado instantáneamente, mencionándole al vecino por qué anuncio lo contactas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><Heart className="w-5 h-5 text-red-500" /></div>
                <span><strong>Favoritos:</strong> Guarda anuncios sin entrar a verlos (hay un ícono de corazón en inicio y perfiles) para encontrarlos después en tu menú de Ajustes.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1"><Inbox className="w-5 h-5 text-blue-500" /></div>
                <span><strong>Detalle de mis compras (Bandeja):</strong> Visualiza los pedidos directos que has hecho y gestiona si ya fueron entregados.</span>
              </li>
            </ul>
          </div>

          {/* Seguridad */}
          <div className="bg-neutral-50 rounded-[32px] p-6 sm:p-8 border border-neutral-100 hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-neutral-800">Seguridad y Comunidad</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Este espacio fue asegurado y está curado por nosotros. La confianza y el respeto mutuo son la base de VeciMarket.
            </p>
            <ul className="space-y-3 text-neutral-600 mb-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" /> 
                <span>Puedes acceder al perfil exclusivo de un vecino simplemente tocando su avatar o su nombre. Verás todos sus anuncios disponibles.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" /> 
                <span>Siempre está disponible el botón de <strong>Reportar</strong>. Úsalo de forma responsable si encuentras contenido indebido o tratos dudosos.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <section className="bg-emerald-50 rounded-[32px] p-6 sm:p-8 border border-emerald-100 flex flex-col items-start">
          <Heart className="w-8 h-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-black text-emerald-900 mb-2">¡Queremos escucharte!</h3>
          <p className="text-emerald-700 mb-6 font-medium text-left">
            ¿Necesitas que agreguemos una nueva categoría? ¿Tienes alguna sugerencia para mejorar la comunidad o requieres soporte?
          </p>
          <a href="mailto:ecolaj@gmail.com" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-sm hover:scale-105 transition-transform hover:bg-emerald-700">
            <Mail className="w-5 h-5" />
            Escríbeme a ecolaj@gmail.com
          </a>
        </section>

      </div>
    </div>
  );
}

// Icono pequeño de helper
function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
