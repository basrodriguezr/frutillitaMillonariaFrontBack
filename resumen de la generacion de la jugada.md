Ip  (mi pc por ahora)
http://172.18.24.34:5117/SolicitaJugada
 
Clave para hash de tramas (tx y rx):
"KeyTx":"945c09e9fff44c61bfddd11a09efa17eec04708f6bf4495f94eed11a09efa17e"
 
Ejemplo validación hash
        if (!context.Request.Headers.TryGetValue("X-Signature", out var firmaCliente))
        {
            MetricsReporter.JugadasTotales.Add(0, new TagList { { "estado", "0" } });
            AsyncJsonLogger.EnqueueLog(0,"Firma del cliente requerida.[" + base64Entrada +"].[" + firmaCliente +"]",fechaIni,null);
            return Results.BadRequest("Firma del cliente requerida.");
        }
 
        byte[] hashEntrada = HMACSHA256.HashData(settings.KEY_BYTES,Encoding.UTF8.GetBytes(base64Entrada));
        if (!string.Equals(Convert.ToHexString(hashEntrada), firmaCliente, StringComparison.OrdinalIgnoreCase))
        {
            MetricsReporter.JugadasTotales.Add(0, new TagList { { "estado", "0" } });
            AsyncJsonLogger.EnqueueLog(0,"Firma no Coincide.[" + base64Entrada +"].[" + firmaCliente +"].[" + Convert.ToHexString(hashEntrada) + "]",fechaIni,null);
            return Results.Unauthorized();
        }
 
 
Clase requerimiento;
public class Request
    {
        public string id {get;set;}
        public string token {get;set;}
        public int precio {get;set;}
        public string producto {get;set;}
 
        public Request()
        {
            id="";
            token="";
            precio=0;
            producto="";
        }
    }
 
Clase respuesta;
public record RespuestaCertificada(Response response,string firmaServidor);
 
    public class Response
    {
        public string id {get;set;}
        public string token {get;set;}
        public int precio {get;set;}
        public string producto {get;set;}
        public long[] ?numeros {get;set;}
        public int estado {get;set;}
        public string msg {get;set;}
        public List<List<string>> ?matrizGenerada {get;set;}
        public RootPremios ?_prem {get;set;}
 
        public Response()
        {
            id="";
            token="";
            precio=0;
            producto="";
            numeros=null;
            estado=0;
            msg="";
            matrizGenerada=new List<List<string>>();
            _prem = new RootPremios();
        }
    }
 
 
    public class RootPremios
    {
        public Premios Premios { get; set; }
 
        public RootPremios()
        {
            Premios = new Premios();
        }
    }
 
 public class Premios
    {
        public decimal totalFactoresCluster { get; set; }
        public decimal montoTotalFactoresCluster { get; set; }
        public decimal totalFactorInstantaneo { get; set; }
        public decimal montoTotalFactorInstantaneo { get; set; }
        public decimal totalFactorAcumulado { get; set; }
        public List<PremiosCluster> PremiosClusters { get; set; }
        public PremioInstantaneo PremioInstantaneo { get; set; }
        public Dictionary<int, PremioAcumulado> PremioAcumulado { get; set; }
 
        public Premios()
        {
            totalFactoresCluster = 0;
            montoTotalFactoresCluster=0;
            totalFactorInstantaneo = 0;
            montoTotalFactorInstantaneo=0;
            totalFactorAcumulado = 0;
            PremiosClusters = new List<PremiosCluster>();
            PremioInstantaneo = new PremioInstantaneo();
            PremioAcumulado = new Dictionary<int, PremioAcumulado>();
        }
 
    }
 
 
    public class PremiosCluster
    {
        public string Simbolo { get; set; }
        public decimal Factor { get; set; }
        public int Cantidad { get; set; }
        public decimal Monto { get; set; }
 
        public List<List<int>> celdasCluster { get; set; }
 
        public PremiosCluster()
        {
            Simbolo = "";
            Factor = 0;
            Cantidad = 0;
            Monto=0;
            celdasCluster = new List<List<int>>();
        }
 
    }
 
 public class PremioInstantaneo
    {
        public string Simbolo { get; set; }
        public decimal Factor { get; set; }
 
        public int Id { get; set; }
        public int Cantidad { get; set; }
 
        public decimal Monto { get; set; }
 
        public List<List<int>> celdasInstantaneo { get; set; }
       
 
        public PremioInstantaneo()
        {
            Simbolo = "";
            Factor = 0;
            Cantidad = 0;
            Id = 0;
            Monto=0;
            celdasInstantaneo = new List<List<int>>();
        }
    }
 
 
 
    public class PremioAcumulado
    {
        public string Simbolo { get; set; }
        public decimal Factor { get; set; }
        public int Id { get; set; }
        public int Cantidad { get; set; }
 
        public List<List<int>> celdasAcumulado { get; set; }
 
        public PremioAcumulado()
        {
            Simbolo = "";
            Factor = 0;
            Cantidad = 0;
            Id = 0;
            celdasAcumulado = new List<List<int>>();
        }
 
    }
 
 
Ejemplo comunicacion .net
using System;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json; // Requiere instalar el paquete NuGet
using System.Threading.Tasks;
 
namespace WindowsFormsApp8
{
    public interface IRngClient
    {
        Task<Response> SolicitarNumerosAsync(string _id, string _token, byte[] _key, int _precio, string _producto);
    }
 
    public class RngClient : IRngClient
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
 
        public RngClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
 
        public async Task<Response> SolicitarNumerosAsync(string _id, string _token, byte[] _key, int _precio, string _producto)
        {
            var solicitud = new Request
            {
                id = _id,
                token = _token,
                precio = _precio,
                producto = _producto
            };
 
            byte[] jsonBytes = JsonSerializer.SerializeToUtf8Bytes(solicitud, _jsonOptions);
            string solicitudB64 = Convert.ToBase64String(jsonBytes);
 
            string signature;
            using (var hmac = new HMACSHA256(_key))
            {
                byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(solicitudB64));
                signature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
 
            // 3. Preparar Contenido
            var content = new StringContent("\"" + solicitudB64 + "\"", Encoding.UTF8, "application/json");
            content.Headers.Add("X-Signature", signature);
 
           
            // 4. Llamada al endpoint
            var response = await _httpClient.PostAsync("/SolicitaJugada", content).ConfigureAwait(false);
 
            if (response.IsSuccessStatusCode)
            {
               byte[] responseData = await response.Content.ReadAsByteArrayAsync().ConfigureAwait(false);
                var resultado = JsonSerializer.Deserialize<RespuestaCertificada>(responseData, _jsonOptions);
 
                if (resultado != null && resultado.response.estado == 1)
                {
                    var objetoParaValidar = new RespuestaCertificada(resultado.response, "");
 
                    byte[] jsonParaValidar = JsonSerializer.SerializeToUtf8Bytes(objetoParaValidar, _jsonOptions);
 
                    string firmaCalculada;
                    using (var hmacValidar = new HMACSHA256(_key))
                    {
                        byte[] hashValidar = hmacValidar.ComputeHash(jsonParaValidar);
                        firmaCalculada = BitConverter.ToString(hashValidar).Replace("-", "");
                    }
 
                    if (!string.Equals(firmaCalculada, resultado.firmaServidor, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new Exception("ERROR DE INTEGRIDAD: La firma del RNG no coincide.");
                    }
 
                    return resultado.response;
                }
            }
 
            throw new Exception("El RNG no devolvió números válidos.");
        }
    }
}
